const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "app", "admin", "quotations", "page.tsx");
let content = fs.readFileSync(file, "utf8");

// Add Split Layout to BlockType
content = content.replace(
  "type BlockType = 'header' | 'text' | 'image' | 'specs_table' | 'pricing_table';",
  "type BlockType = 'header' | 'text' | 'image' | 'specs_table' | 'pricing_table' | 'split_layout';"
);

// Add Columns icon
content = content.replace(
  "LayoutList, DollarSign, FileDown, Settings",
  "LayoutList, DollarSign, FileDown, Settings, Columns"
);

// Add initial content
const addBlockRegex = /case 'pricing_table':[\s\S]*?break;/;
const addBlockMatch = content.match(addBlockRegex);
if (addBlockMatch) {
  content = content.replace(
    addBlockMatch[0],
    addBlockMatch[0] + "\n      case 'split_layout':\n        initialContent = { mode: 'image-text', leftText: 'Type here...', rightText: 'Type here...', leftImageUrl: '', rightImageUrl: '' };\n        break;"
  );
}

// Add Toolbox Button
const toolboxRegex = /<button onClick=\{\(\) => addBlock\('pricing_table'\)\} className="toolbox-btn"><DollarSign size=\{16\} \/> Pricing Table<\/button>/;
const toolboxMatch = content.match(toolboxRegex);
if (toolboxMatch) {
  content = content.replace(
    toolboxMatch[0],
    toolboxMatch[0] + '\n              <button onClick={() => addBlock(\'split_layout\')} className="toolbox-btn"><Columns size={16} /> Split Layout</button>'
  );
}

// Add Canvas Render
const renderTarget = /\{\/\* --- RENDER PRICING TABLE BLOCK ---\*\/\}[\s\S]*?<\/\div>\s*\)\}\s*<\/div>\s*\);\s*}\)}\s*<\/div>\s*<\/div>/;

const splitLayoutRender = `
                {/* --- RENDER SPLIT LAYOUT BLOCK --- */}
                {block.type === 'split_layout' && (
                  <div className="block-wrapper group/split relative">
                    {/* Controls */}
                    <div className="print:hidden absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-slate-200 text-xs flex gap-4 opacity-0 group-hover/split:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={block.content.mode === 'image-text'} onChange={() => updateBlock(block.id, {...block.content, mode: 'image-text'})} /> Image | Text</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={block.content.mode === 'text-image'} onChange={() => updateBlock(block.id, {...block.content, mode: 'text-image'})} /> Text | Image</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={block.content.mode === 'text-text'} onChange={() => updateBlock(block.id, {...block.content, mode: 'text-text'})} /> Text | Text</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={block.content.mode === 'image-image'} onChange={() => updateBlock(block.id, {...block.content, mode: 'image-image'})} /> Image | Image</label>
                    </div>

                    <div className="flex gap-8 items-start w-full min-h-[150px]">
                      {/* LEFT COLUMN */}
                      <div className="flex-1 w-1/2">
                        {['image-text', 'image-image'].includes(block.content.mode) ? (
                          block.content.leftImageUrl ? (
                            <div className="relative">
                              <img src={block.content.leftImageUrl} alt="Left Content" className="w-full h-auto rounded-xl object-contain" />
                              <button onClick={() => updateBlock(block.id, {...block.content, leftImageUrl: ''})} className="print:hidden absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <label className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-colors bg-slate-50 print:hidden">
                              <ImageIcon size={24} className="mb-2" />
                              <span className="text-xs font-bold uppercase">Upload Left Image</span>
                              <input type="file" accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  updateBlock(block.id, { ...block.content, leftImageUrl: URL.createObjectURL(e.target.files[0]) });
                                }
                              }} className="hidden" />
                            </label>
                          )
                        ) : (
                          <textarea 
                            className="w-full text-slate-700 bg-transparent outline-none hover:bg-slate-50 min-h-[150px] resize-none leading-relaxed"
                            value={block.content.leftText}
                            onChange={e => { updateBlock(block.id, { ...block.content, leftText: e.target.value }); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            onFocus={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                          />
                        )}
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="flex-1 w-1/2">
                        {['text-image', 'image-image'].includes(block.content.mode) ? (
                          block.content.rightImageUrl ? (
                            <div className="relative">
                              <img src={block.content.rightImageUrl} alt="Right Content" className="w-full h-auto rounded-xl object-contain" />
                              <button onClick={() => updateBlock(block.id, {...block.content, rightImageUrl: ''})} className="print:hidden absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <label className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-colors bg-slate-50 print:hidden">
                              <ImageIcon size={24} className="mb-2" />
                              <span className="text-xs font-bold uppercase">Upload Right Image</span>
                              <input type="file" accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  updateBlock(block.id, { ...block.content, rightImageUrl: URL.createObjectURL(e.target.files[0]) });
                                }
                              }} className="hidden" />
                            </label>
                          )
                        ) : (
                          <textarea 
                            className="w-full text-slate-700 bg-transparent outline-none hover:bg-slate-50 min-h-[150px] resize-none leading-relaxed"
                            value={block.content.rightText}
                            onChange={e => { updateBlock(block.id, { ...block.content, rightText: e.target.value }); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            onFocus={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
`;

const renderTargetMatch = content.match(renderTarget);
if (renderTargetMatch) {
  content = content.replace(
    /\{\/\* --- RENDER PRICING TABLE BLOCK ---\*\/\}[\s\S]*?<\/\div>\s*\)\}\s*<\/div>\s*\);\s*}\)}\s*<\/div>\s*<\/div>/,
    match => match.replace(
      '</div>\n            );\n          })}\n          \n        </div>\n      </div>',
      splitLayoutRender + '\n              </div>\n            );\n          })}\n          \n        </div>\n      </div>'
    )
  );
} else {
  console.log("Could not find render target");
}

fs.writeFileSync(file, content, "utf8");
console.log("Updated Split Layout in page.tsx");
