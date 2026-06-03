'use client';

import React, { forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// To support image resizing, we must load the resize module on the client side.
let BlotFormatter: any;
if (typeof window !== 'undefined') {
  (window as any).Quill = Quill;
  // Use require so it only executes when window is available
  BlotFormatter = require('@enzedonline/quill-blot-formatter2').default;
  Quill.register('modules/blotFormatter', BlotFormatter);
}

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  blotFormatter: {}
};

const SIMPLE_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const QuillEditor = forwardRef<ReactQuill, any>((props, ref) => {
  const { simple, ...rest } = props;
  return (
    <ReactQuill
      ref={ref}
      theme="snow"
      modules={simple ? SIMPLE_MODULES : QUILL_MODULES}
      {...rest}
    />
  );
});

QuillEditor.displayName = 'QuillEditor';
export default QuillEditor;
