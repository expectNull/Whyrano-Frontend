import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import Button from '@mui/material/Button';

import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';

import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';

function EditorPage({}) {
  const editorRef = useRef();
  const handleSave = () => {
    const editorInstance = editorRef.current.getInstance();
    const getContent_md = editorInstance.getMarkdown();
    console.log('--마크다운--');
    console.log(getContent_md);
    const getContent_html = editorInstance.getHTML();
    console.log('--HTML--');
    console.log(getContent_html);
  };
  return (
    <div className="page">
      <Editor
        initialValue="# 내용을 입력해주세요."
        previewStyle="vertical"
        plugins={[colorSyntax, [codeSyntaxHighlight, { highlighter: Prism }]]}
        ref={editorRef}
      />
      <Button onClick={handleSave} variant="contained">
        Save
      </Button>
    </div>
  );
}

export default EditorPage;
