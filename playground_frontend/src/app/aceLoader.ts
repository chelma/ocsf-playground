import type * as AceType from 'ace-builds';

export async function aceLoader(): Promise<typeof AceType> {
  try {
    // Import ace
    const ace = await import('ace-builds');
    
    // Manually set path for ace
    ace.config.set('basePath', '/node_modules/ace-builds/src-min-noconflict');
    
    // Load modes for the languages we support
    await import('ace-builds/src-noconflict/mode-python');
    await import('ace-builds/src-noconflict/mode-javascript');
    
    // Load common themes
    await import('ace-builds/src-noconflict/theme-dawn');
    await import('ace-builds/src-noconflict/theme-github');
    await import('ace-builds/src-noconflict/theme-monokai');
    await import('ace-builds/src-noconflict/theme-terminal');

    // Load essential extensions
    await import('ace-builds/src-noconflict/ext-language_tools');
    await import('ace-builds/src-noconflict/ext-searchbox');

    return ace;
  } catch (error) {
    console.error('Failed to load Ace editor:', error);
    throw error;
  }
}
