import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrongsEntry {
  strongs_id: string;
  portuguese_word: string;
  portuguese_definition: string;
  portuguese_usage?: string;
  original_word?: string;
  transliteration?: string;
  part_of_speech?: string;
}

// Parse the dictionary text content
function parseDictionaryText(text: string): StrongsEntry[] {
  const entries: StrongsEntry[] = [];
  const lines = text.split('\n');
  
  let currentNumber: string | null = null;
  let currentOriginalWord: string | null = null;
  let currentTranslit: string | null = null;
  let currentDefinition: string[] = [];
  let currentPartOfSpeech: string | null = null;
  let isHebrew = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and page markers
    if (!line || line.startsWith('### Images') || line.startsWith('## Page') || line.startsWith('- `parsed-documents')) {
      continue;
    }
    
    // Check for section marker
    if (line.includes('Strongs em Grego') || line.includes('Léxico Grego')) {
      isHebrew = false;
      continue;
    }
    
    // Match Strong's number patterns like "# 01", "# 02", "0137", "01     'ab", etc.
    const numberMatch = line.match(/^#?\s*(\d{1,4})\s*(?:'|$)/);
    const tableNumberMatch = line.match(/\|\s*(\d{2,4})\s*\|?\s*'/);
    const standaloneNumber = line.match(/^(\d{2,4})\s+'/);
    
    let foundNumber: string | null = null;
    
    if (numberMatch) {
      foundNumber = numberMatch[1];
    } else if (tableNumberMatch) {
      foundNumber = tableNumberMatch[1];
    } else if (standaloneNumber) {
      foundNumber = standaloneNumber[1];
    }
    
    if (foundNumber) {
      // Save previous entry if exists
      if (currentNumber && currentDefinition.length > 0) {
        const prefix = isHebrew ? 'H' : 'G';
        const paddedNum = currentNumber.padStart(4, '0');
        
        entries.push({
          strongs_id: `${prefix}${paddedNum}`,
          portuguese_word: currentOriginalWord || '',
          portuguese_definition: currentDefinition.slice(0, 3).join('; ').substring(0, 500),
          portuguese_usage: currentDefinition.slice(3).join('; ').substring(0, 500) || undefined,
          original_word: currentOriginalWord || undefined,
          transliteration: currentTranslit || undefined,
          part_of_speech: currentPartOfSpeech || undefined,
        });
      }
      
      // Reset for new entry
      currentNumber = foundNumber;
      currentOriginalWord = null;
      currentTranslit = null;
      currentDefinition = [];
      currentPartOfSpeech = null;
      
      // Try to extract transliteration from the same line
      const translitMatch = line.match(/'([^']+)'/);
      if (translitMatch) {
        currentTranslit = translitMatch[1];
      }
      continue;
    }
    
    // Match Hebrew/Greek original word (starts with Hebrew/Greek characters)
    if (currentNumber && !currentOriginalWord && /^[\u0590-\u05FF\u0370-\u03FF]/.test(line)) {
      currentOriginalWord = line.split(/\s+/)[0];
      continue;
    }
    
    // Match transliteration line (only ASCII with quotes)
    if (currentNumber && !currentTranslit && line.startsWith("'") && line.endsWith("'")) {
      currentTranslit = line.replace(/'/g, '');
      continue;
    }
    
    // Match part of speech indicators
    const posMatch = line.match(/;\s*(n\s*[mf]|v|adj|adv|prep|conj|interj|n\s*pr\s*[mfl]?|exclamação)/i);
    if (posMatch) {
      currentPartOfSpeech = posMatch[1];
    }
    
    // Match definition lines (numbered or starting with meaningful content)
    if (currentNumber) {
      // Definition patterns
      const defMatch = line.match(/^(?:\d+[\.\)]\s*)?(.+)/);
      if (defMatch) {
        const content = defMatch[1].trim();
        // Skip noise
        if (content.length > 2 && 
            !content.startsWith('|') && 
            !content.startsWith('#') &&
            !content.match(/^DITAT/) &&
            !content.match(/^procedente de/i) &&
            !content.match(/^correspondente a/i) &&
            !content.match(/^uma raiz/i) &&
            !content.match(/^de origem/i) &&
            !content.match(/^grego \d+/i) &&
            !content.match(/^particípio/i) &&
            !content.match(/^intensivo/i) &&
            content.length < 300) {
          // Clean up the definition
          const cleanDef = content
            .replace(/^[a-z]\)\s*/i, '')
            .replace(/^1[a-z]\)\s*/i, '')
            .replace(/^\d+\)\s*/, '')
            .replace(/\(fig\.\)/g, '')
            .replace(/\(espec\.\)/g, '')
            .trim();
          
          if (cleanDef.length > 2) {
            currentDefinition.push(cleanDef);
          }
        }
      }
    }
  }
  
  // Don't forget the last entry
  if (currentNumber && currentDefinition.length > 0) {
    const prefix = isHebrew ? 'H' : 'G';
    const paddedNum = currentNumber.padStart(4, '0');
    
    entries.push({
      strongs_id: `${prefix}${paddedNum}`,
      portuguese_word: currentOriginalWord || '',
      portuguese_definition: currentDefinition.slice(0, 3).join('; ').substring(0, 500),
      portuguese_usage: currentDefinition.slice(3).join('; ').substring(0, 500) || undefined,
      original_word: currentOriginalWord || undefined,
      transliteration: currentTranslit || undefined,
      part_of_speech: currentPartOfSpeech || undefined,
    });
  }
  
  return entries;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dictionaryText } = await req.json();

    if (!dictionaryText) {
      return new Response(
        JSON.stringify({ success: false, error: 'No dictionary text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing dictionary text, length:', dictionaryText.length);
    
    const entries = parseDictionaryText(dictionaryText);
    
    console.log('Parsed entries count:', entries.length);
    
    if (entries.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No entries parsed from text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert in batches
    const batchSize = 100;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('strongs_translations')
        .upsert(batch, { 
          onConflict: 'strongs_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Batch insert error:', error);
        errors.push(`Batch ${i}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    console.log('Import complete. Inserted:', inserted, 'Errors:', errors.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: inserted,
        total: entries.length,
        errors: errors.length > 0 ? errors : undefined,
        sample: entries.slice(0, 5)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-strongs-dictionary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
