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

// Improved parser for the PDF dictionary format
function parseDictionaryText(text: string): StrongsEntry[] {
  const entries: StrongsEntry[] = [];
  const lines = text.split('\n');
  
  let currentNumber: string | null = null;
  let currentOriginalWord: string | null = null;
  let currentTranslit: string | null = null;
  let currentDefinition: string[] = [];
  let currentPartOfSpeech: string | null = null;
  let isHebrew = true;
  let currentMeaning: string | null = null;
  
  const saveEntry = () => {
    if (currentNumber && (currentDefinition.length > 0 || currentMeaning)) {
      const prefix = isHebrew ? 'H' : 'G';
      const paddedNum = currentNumber.padStart(4, '0');
      
      // Build definition from meaning and definition lines
      let fullDefinition = '';
      if (currentMeaning) {
        fullDefinition = currentMeaning;
      }
      if (currentDefinition.length > 0) {
        const defs = currentDefinition.join('; ');
        fullDefinition = fullDefinition ? `${fullDefinition} - ${defs}` : defs;
      }
      
      if (fullDefinition) {
        entries.push({
          strongs_id: `${prefix}${paddedNum}`,
          portuguese_word: currentTranslit || currentOriginalWord || '',
          portuguese_definition: fullDefinition.substring(0, 1000),
          portuguese_usage: currentDefinition.slice(3).join('; ').substring(0, 500) || undefined,
          original_word: currentOriginalWord || undefined,
          transliteration: currentTranslit || undefined,
          part_of_speech: currentPartOfSpeech || undefined,
        });
      }
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, image markers, and page markers
    if (!line || 
        line.startsWith('### Images') || 
        line.startsWith('## Page') || 
        line.startsWith('- `parsed-documents') ||
        line.startsWith('| ---') ||
        line === '---') {
      continue;
    }
    
    // Check for Greek section marker
    if (line.includes('Strongs em Grego') || line.includes('Léxico Grego') || line.includes('Dicionário Grego')) {
      saveEntry();
      isHebrew = false;
      currentNumber = null;
      currentOriginalWord = null;
      currentTranslit = null;
      currentDefinition = [];
      currentPartOfSpeech = null;
      currentMeaning = null;
      continue;
    }
    
    // Pattern 1: "# XX" or "# XXX" or "# XXXX" format (most common in PDF)
    const hashNumberMatch = line.match(/^#\s*(\d{1,5})\s*$/);
    
    // Pattern 2: "XXX 'word" format like "022    'Abiy'el"
    const numWithWord = line.match(/^(\d{2,5})\s+'([^']+)'/);
    
    // Pattern 3: Table format "| XXX | word |"
    const tableMatch = line.match(/\|\s*(\d{2,5})\s*\|.*'([^']+)'/);
    
    // Pattern 4: Just number at start "057  'abel"
    const simpleNumMatch = line.match(/^(\d{2,5})\s+'([^']+)'/);
    
    // Pattern 5: Number in header format "| 046 | 'abiyr |"
    const headerTableMatch = line.match(/\|\s*(\d{2,5})\s*\|\s*'([^'|]+)/);
    
    let foundNumber: string | null = null;
    let foundTranslit: string | null = null;
    
    if (hashNumberMatch) {
      foundNumber = hashNumberMatch[1];
    } else if (numWithWord) {
      foundNumber = numWithWord[1];
      foundTranslit = numWithWord[2];
    } else if (tableMatch) {
      foundNumber = tableMatch[1];
      foundTranslit = tableMatch[2];
    } else if (simpleNumMatch) {
      foundNumber = simpleNumMatch[1];
      foundTranslit = simpleNumMatch[2];
    } else if (headerTableMatch) {
      foundNumber = headerTableMatch[1];
      foundTranslit = headerTableMatch[2].trim();
    }
    
    // Also check for standalone numbers like "01", "02" after # symbol
    if (!foundNumber) {
      const standaloneMatch = line.match(/^#?\s*0*(\d{1,5})\s*$/);
      if (standaloneMatch && parseInt(standaloneMatch[1]) > 0) {
        foundNumber = standaloneMatch[1];
      }
    }
    
    if (foundNumber) {
      // Save previous entry
      saveEntry();
      
      // Reset for new entry
      currentNumber = foundNumber;
      currentOriginalWord = null;
      currentTranslit = foundTranslit || null;
      currentDefinition = [];
      currentPartOfSpeech = null;
      currentMeaning = null;
      continue;
    }
    
    // If we're collecting data for an entry
    if (currentNumber) {
      // Match Hebrew/Greek original word
      if (!currentOriginalWord && /^[\u0590-\u05FF\u0370-\u03FF]/.test(line)) {
        currentOriginalWord = line.split(/\s+/)[0];
        continue;
      }
      
      // Match transliteration with single quotes
      if (!currentTranslit) {
        const translitMatch = line.match(/'([a-zA-Z][a-zA-Z\s\-àáâãäåèéêëìíîïòóôõöùúûü]+)'/i);
        if (translitMatch) {
          currentTranslit = translitMatch[1].trim();
        }
      }
      
      // Match meaning in quotes like: Abiel = "El (Deus) é (meu) pai"
      const meaningMatch = line.match(/=\s*"([^"]+)"/);
      if (meaningMatch) {
        currentMeaning = meaningMatch[1];
        continue;
      }
      
      // Match part of speech
      const posMatch = line.match(/;\s*(n\s*[mf]|v|adj|adv|prep|conj|interj|n\s*pr\s*[mfl]?)/i);
      if (posMatch) {
        currentPartOfSpeech = posMatch[1];
      }
      
      // Match definitions (numbered like "1." or "1)" or just content after parentheses)
      // Also match lines starting with letters like "1a)" or "1a1)"
      const defPatterns = [
        /^(\d+[\.\)])\s*(.+)/,           // 1. definition or 1) definition
        /^(\d+[a-z][\.\)])\s*(.+)/,      // 1a. or 1a)
        /^(\d+[a-z]\d+[\.\)])\s*(.+)/,   // 1a1) or 1a1.
        /^([a-z][\.\)])\s*(.+)/i,        // a. or a)
      ];
      
      let foundDef = false;
      for (const pattern of defPatterns) {
        const defMatch = line.match(pattern);
        if (defMatch) {
          const content = defMatch[2].trim();
          if (content.length > 2 && !content.startsWith('|')) {
            currentDefinition.push(content);
            foundDef = true;
            break;
          }
        }
      }
      
      // If not a numbered definition, check for meaningful content
      if (!foundDef && line.length > 3) {
        const skipPatterns = [
          /^#/,
          /^\|/,
          /^DITAT/i,
          /^procedente de/i,
          /^correspondente a/i,
          /^uma raiz/i,
          /^de origem/i,
          /^grego \d+/i,
          /^particípio/i,
          /^intensivo/i,
          /^forma contrat/i,
          /^aparentemente/i,
          /^derivação/i,
          /^Qal/,
          /^Piel/,
          /^Hifil/,
          /^Hofal/,
          /^Hitpael/,
          /^Peal/,
          /^Afel/,
          /^Ver /,
          /^Essa forma/,
          /^Expressão/,
          /^Ação/,
          /^Alguns verbos/,
          /^Esta obra/,
          /^O vocábulo/,
        ];
        
        const shouldSkip = skipPatterns.some(p => p.test(line));
        
        if (!shouldSkip && !line.includes('---') && line.length < 200) {
          // Check if it looks like a definition (contains Portuguese words)
          if (/[a-záàâãéèêíìîóòôõúùû]{3,}/i.test(line)) {
            // Clean the definition
            const cleanDef = line
              .replace(/\(fig\.\)/g, '')
              .replace(/\(espec\.\)/g, '')
              .replace(/\(metáfora\)/g, '')
              .trim();
            
            if (cleanDef.length > 3 && currentDefinition.length < 10) {
              currentDefinition.push(cleanDef);
            }
          }
        }
      }
    }
  }
  
  // Don't forget the last entry
  saveEntry();
  
  // Remove duplicates by strongs_id (keep first occurrence)
  const seen = new Set<string>();
  const uniqueEntries: StrongsEntry[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.strongs_id)) {
      seen.add(entry.strongs_id);
      uniqueEntries.push(entry);
    }
  }
  
  return uniqueEntries;
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
    console.log('Sample entries:', JSON.stringify(entries.slice(0, 3)));
    
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
