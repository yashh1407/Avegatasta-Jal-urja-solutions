import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

function DynamicJsonEditor({ jsonString, onChange }: { jsonString: string, onChange: (val: string) => void }) {
  let data: any = {};
  let isArrayRoot = false;
  try {
    data = JSON.parse(jsonString);
    if (Array.isArray(data)) isArrayRoot = true;
  } catch (e) {
    // If not valid JSON, show nothing or minimal
    return <div className="text-sm text-red-500">Invalid JSON data.</div>;
  }

  const handleChange = (path: (string | number)[], value: string) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    let curr: any = newData;
    for (let i = 0; i < path.length - 1; i++) {
      curr = curr[path[i]];
    }
    curr[path[path.length - 1]] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleAddItem = (path: (string | number)[], templateItem: any) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (path.length === 0 && Array.isArray(newData)) {
      newData.push(templateItem);
    } else {
      let curr: any = newData;
      for (let i = 0; i < path.length; i++) {
        curr = curr[path[i]];
      }
      if (Array.isArray(curr)) {
        curr.push(templateItem);
      }
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleRemoveItem = (path: (string | number)[], index: number) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (path.length === 0 && Array.isArray(newData)) {
      newData.splice(index, 1);
    } else {
      let curr: any = newData;
      for (let i = 0; i < path.length; i++) {
        curr = curr[path[i]];
      }
      if (Array.isArray(curr)) {
        curr.splice(index, 1);
      }
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: (string | number)[]) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const resData = await res.json();
      
      if (resData.url) {
        handleChange(path, resData.url);
        toast.success('Image uploaded successfully!', { id: toastId });
      } else {
        toast.error(resData.error || 'Upload failed', { id: toastId });
      }
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message, { id: toastId });
    }
  };

  const renderField = (val: any, path: (string | number)[], name: string): React.ReactNode => {
    if (typeof val === 'string' || typeof val === 'number') {
      const label = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const isImage = typeof val === 'string' && name.toLowerCase().includes('image');

      return (
        <div key={path.join('.')} className="space-y-1 mb-3">
          <label className="text-xs font-bold text-gray-700">{label}</label>
          
          {isImage && (
            <div className="flex items-center gap-4 mb-2 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
              {val ? (
                <img src={val} alt="preview" className="h-12 w-12 object-cover rounded shadow-sm border border-gray-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
              )}
              <div className="flex-1 relative">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, path)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-md text-xs font-medium text-gray-700 transition-colors shadow-sm cursor-pointer">
                  <Upload size={14} />
                  Upload New Image
                </div>
              </div>
            </div>
          )}

          {typeof val === 'string' && val.length > 60 && !isImage ? (
            <textarea
              value={val}
              onChange={e => handleChange(path, e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={e => handleChange(path, e.target.value)}
              placeholder={isImage ? "Or paste image URL here..." : ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none"
            />
          )}
        </div>
      );
    }
    if (Array.isArray(val)) {
      const templateItem = val.length > 0 ? (typeof val[0] === 'object' ? Object.fromEntries(Object.keys(val[0]).map(k => [k, ''])) : '') : '';
      return (
        <div key={path.join('.')} className="mb-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-gray-800 capitalize">{name.replace(/_/g, ' ')}</label>
            <button
              onClick={(e) => { e.preventDefault(); handleAddItem(path, templateItem); }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {val.map((item, idx) => (
              <div key={idx} className="relative p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemoveItem(path, idx); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="text-xs font-semibold text-gray-500 mb-3 pr-8">Item {idx + 1}</div>
                {renderField(item, [...path, idx], 'Item')}
              </div>
            ))}
            {val.length === 0 && <div className="text-sm text-gray-400 italic">No items added yet.</div>}
          </div>
        </div>
      );
    }
    if (typeof val === 'object' && val !== null) {
      return (
        <div key={path.join('.')} className="mb-3 space-y-3">
          {Object.keys(val).map(k => renderField(val[k], [...path, k], k))}
        </div>
      );
    }
    return null;
  };

  const isEmpty = Object.keys(data).length === 0;

  if (isEmpty) return <div className="text-sm text-gray-400 italic">No additional content fields required for this section.</div>;

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
      {renderField(data, [], isArrayRoot ? 'Items' : 'Properties')}
    </div>
  );
}

export default function SectionEditorModal({ 
  section, 
  onSave, 
  onClose 
}: { 
  section: any; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    section_type: '',
    section_key: '',
    category: '',
    title: '',
    subtitle: '',
    content: '',
    is_active: true,
    data_json: '{}'
  });

  useEffect(() => {
    if (section) {
      setFormData({
        section_type: section.section_type || '',
        section_key: section.section_key || '',
        category: section.category || '',
        title: section.title || '',
        subtitle: section.subtitle || '',
        content: section.content || '',
        is_active: section.is_active !== false,
        data_json: typeof section.data_json === 'string' ? section.data_json : JSON.stringify(section.data_json || {}, null, 2)
      });
    }
  }, [section]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    try {
      // Validate JSON
      const parsedJson = JSON.parse(formData.data_json);
      onSave({ ...formData, id: section?.id, data_json: parsedJson });
    } catch (e) {
      alert("Invalid JSON data. Please check your data format.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#1B3636]">
            {section?.id ? 'Edit Section' : 'Add New Section'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span className="font-medium text-gray-700">Section Visibility</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3636]"></div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Section Type / Component Name *</label>
            <input name="section_type" value={formData.section_type} onChange={handleChange} placeholder="e.g., HeroSection" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" required />
            <p className="text-xs text-gray-500">The React component name used to render this section.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Section Key / Slug *</label>
            <input name="section_key" value={formData.section_key} onChange={handleChange} placeholder="e.g., home-hero" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Admin Category</label>
            <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Homepage" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Main Headline (Title)</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Enterprise Water Solutions" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Sub-Heading (Subtitle/Badge)</label>
            <input name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Heading text..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Content / Description</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={4} placeholder="Description text..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Section Data</label>
            <DynamicJsonEditor jsonString={formData.data_json} onChange={(val) => setFormData(prev => ({...prev, data_json: val}))} />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-[#1B3636] hover:bg-[#122626] rounded-lg shadow-sm transition-colors">Save Section</button>
        </div>
      </div>
    </div>
  );
}
