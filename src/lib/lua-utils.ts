
/**
 * Removes all single-line and multi-line comments from Lua code.
 * @param code The input Lua code string.
 * @returns Code with comments removed.
 */
export function deleteAllComments(code: string): string {
  // Remove multi-line comments, including nested ones of the form --[=[ ... ]=]
  let result = code.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, '');
  // Remove single-line comments that are not part of a multi-line comment start
  result = result.replace(/--(?![\[=]*\[).*/g, '');
  // Remove resulting empty lines
  result = result.replace(/^\s*[\r\n]/gm, '');
  return result;
}

/**
 * Checks if the Lua code contains any comments.
 * @param code The input Lua code string.
 * @returns True if comments are found, false otherwise.
 */
export function hasComments(code: string): boolean {
  // Regex for multi-line comments: --[[ ... ]] or --[=[ ... ]=]
  const multiLineRegex = /--\[(=*)\[[\s\S]*?\]\1\]/;
  // Regex for single-line comments that are not part of a multi-line comment start
  const singleLineRegex = /--(?![\[=]*\[)/;
  
  return multiLineRegex.test(code) || singleLineRegex.test(code);
}

/**
 * Converts multi-line Lua code into a single line.
 * @param code The input Lua code.
 * @param commentOption Whether to 'preserve' or 'delete' comments.
 * @returns Single-line code string.
 */
export function toOneLiner(code: string, commentOption: 'preserve' | 'delete'): string {
  let oneLiner = code;
  if (commentOption === 'delete') {
    oneLiner = deleteAllComments(oneLiner);
  } else {
    // Preserve: Convert single-line comments to block comments to preserve them.
    // This is necessary because a single-line comment would comment out the rest of the code.
    oneLiner = oneLiner.replace(/--[ \t]*(?!\[(?:=|\[)?)(.*)/g, (match, content) => {
        const trimmed = content.trim();
        return trimmed ? ` --[[ ${trimmed} ]] ` : '';
    });
  }
  
  // Replace newlines and tabs with a space, then collapse multiple spaces.
  oneLiner = oneLiner.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return oneLiner;
}

/**
 * Reverses the input string.
 * @param code The input string.
 * @returns The reversed string.
 */
export function reverseCode(code: string): string {
  return code.split('').reverse().join('');
}

/**
 * Beautifies Lua code with basic indentation. Note: this is a simple formatter and may not be perfect.
 * It can convert one-liners into multi-line formatted code.
 * @param code The input Lua code string.
 * @returns Formatted code.
 */
export function beautifyCode(code: string): string {
  try {
    // This is a very basic beautifier.
    let indentLevel = 0;
    const indentChar = '  ';
    // Add newlines to break up one-liners
    const processedCode = code
      .replace(/;/g, ';\n') // After semicolons
      .replace(/\)\s*(?=[a-zA-Z_])/g, ')\n') // After a parenthesis ending a statement
      .replace(/\b(then|do)\b/g, '$1\n') // After then/do
      .replace(/\b(end|else|elseif|until)\b/g, '\n$1'); // Before end/else/elseif/until

    const lines = processedCode.split('\n');
    let formatted = '';
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.match(/^(end|else|elseif|until)\b/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formatted += indentChar.repeat(indentLevel) + line + '\n';
      
      if (line.match(/\b(function|if|while|for|repeat|do|then)\b/)) {
        // Avoid double indenting on one-line blocks that contain 'end'
        if (!line.match(/\b(end)\b/)) {
          // and don't re-indent for else/elseif
           if (!line.match(/^(else|elseif)\b/)) {
             indentLevel++;
           }
        }
      }
    }
    return formatted.replace(/\n\s*\n/g, '\n').trim();

  } catch (e) {
    console.error('Error beautifying code:', e);
    return code;
  }
}
