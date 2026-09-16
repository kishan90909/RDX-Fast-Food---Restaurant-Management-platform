import { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaTrash, FaTimes, FaArrowLeft, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa'
import { api } from '../api.js'

const emptyForm = { category: '', name: '', price: '', bestseller: false, special: false, available: true }

const normalizeCatalog = (catalog) => {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) return {}
  return Object.fromEntries(
    Object.entries(catalog)
      .filter(([category, items]) => category && Array.isArray(items))
      .map(([category, items]) => [
        category,
        items.map((item) => ({
          ...item,
          available: item.available !== false,
        })),
      ])
  )
}

const MenuManagement = ({ isOpen, onBack, onClose }) => {
  const [catalog, setCatalog] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const loadCatalog = async () => {
    try {
      const response = await api.menuAdmin.list()
      const normalized = normalizeCatalog(response.catalog || {})
      setCatalog(normalized)
      setSelectedCategory((current) => current && normalized[current] ? current : Object.keys(normalized)[0] || '')
    } catch (error) {
      setCatalog({})
      setSelectedCategory('')
      if (isOpen) window.alert(error.message || 'Unable to load menu from the server.')
    }
  }

  useEffect(() => {
    if (!isOpen) return
    loadCatalog()
  }, [isOpen])

  const categories = Object.keys(catalog)

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = selectedCategory ? (catalog[selectedCategory] || []) : []
    if (!query) return items
    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [catalog, selectedCategory, search])

  if (!isOpen) return null

  const syncCatalog = (nextCatalog) => {
    const normalized = normalizeCatalog(nextCatalog)
    setCatalog(normalized)
  }

  const startAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, category: selectedCategory || categories[0] || '' })
  }

  const startEdit = (item) => {
    setEditing(item.itemId || item.id || item.name)
    setForm({
      category: selectedCategory,
      name: item.name,
      price: item.price,
      bestseller: Boolean(item.bestseller),
      special: Boolean(item.special),
      available: item.available !== false,
    })
  }

  const saveItem = async (event) => {
    event.preventDefault()
    const category = form.category.trim()
    const name = form.name.trim()
    const price = form.price.trim()
    if (!category || !name || !price) return

    try {
      if (editing) {
        await api.menuAdmin.update(editing, {
          category,
          name,
          price,
          bestseller: form.bestseller,
          special: form.special,
          available: form.available,
        })
      } else {
        await api.menuAdmin.create({
          category,
          name,
          price,
          bestseller: form.bestseller,
          special: form.special,
          available: form.available,
        })
      }
      const response = await api.menuAdmin.list()
      const normalized = normalizeCatalog(response.catalog || {})
      syncCatalog(normalized)
      setSelectedCategory(category)
      setEditing(null)
      setForm({ ...emptyForm, category })
    } catch (error) {
      window.alert(error.message || 'Unable to save menu item.')
    }
  }

  const removeItem = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    const itemId = item.itemId || item.id
    if (!itemId) return window.alert('This menu item has no server ID.')
    try {
      await api.menuAdmin.remove(itemId)
      const response = await api.menuAdmin.list()
      const normalized = normalizeCatalog(response.catalog || {})
      syncCatalog(normalized)
      if (editing === itemId) {
        setEditing(null)
        setForm({ ...emptyForm, category: selectedCategory })
      }
    } catch (error) {
      window.alert(error.message || 'Unable to delete menu item.')
    }
  }

  const toggleAvailability = async (item) => {
    const itemId = item.itemId || item.id
    if (!itemId) return window.alert('This menu item has no server ID.')
    try {
      await api.menuAdmin.update(itemId, { available: item.available === false })
      const response = await api.menuAdmin.list()
      syncCatalog(normalizeCatalog(response.catalog || {}))
    } catch (error) {
      window.alert(error.message || 'Unable to update menu availability.')
    }
  }

  const deleteCategory = async () => {
    if (!selectedCategory || !window.confirm(`Delete the entire ${selectedCategory} category?`)) return
    try {
      await api.menuAdmin.removeCategory(selectedCategory)
      const response = await api.menuAdmin.list()
      const normalized = normalizeCatalog(response.catalog || {})
      syncCatalog(normalized)
      setSelectedCategory(Object.keys(normalized)[0] || '')
      setEditing(null)
      setForm(emptyForm)
    } catch (error) {
      window.alert(error.message || 'Unable to delete menu category.')
    }
  }

  return (
    <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Menu Management</h2>
              <p className="text-sm text-gray-500 mt-1">Add, edit, remove and control menu availability.</p>
            </div>
            <div className="flex items-center gap-2"><button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close menu management"><FaTimes /></button></div>
          </header>

          <main className="p-5 sm:p-7 space-y-6">
            <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
              <aside className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4 h-fit">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-white">Categories</h3>
                  <button type="button" onClick={() => { setSelectedCategory(''); setForm({ ...emptyForm }); setEditing(null) }} className="text-xs text-primary hover:text-white">New</button>
                </div>
                <div className="space-y-1 max-h-[55vh] overflow-y-auto">
                  {categories.map((category) => (
                    <button key={category} type="button" onClick={() => { setSelectedCategory(category); setEditing(null); setForm({ ...emptyForm, category }) }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                      <span>{category}</span><span className="float-right opacity-60">{catalog[category].length}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedCategory || 'New Menu Item'}</h3>
                    {selectedCategory && <p className="text-xs text-gray-500 mt-1">{catalog[selectedCategory]?.length || 0} items</p>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={startAdd} className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-4 py-2 rounded-full text-sm font-semibold"><FaPlus /> Add Item</button>
                    {selectedCategory && <button type="button" onClick={deleteCategory} className="px-4 py-2 rounded-full text-sm border border-red-500/30 text-red-300 hover:bg-red-500/10">Delete Category</button>}
                  </div>
                </div>

                <form onSubmit={saveItem} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="input-field" />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" className="input-field" />
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price e.g. ₹99 / ₹149" className="input-field" />
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} /> Bestseller</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.special} onChange={(e) => setForm({ ...form, special: e.target.checked })} /> Chef's Special</label>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button type="submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-5 py-2 rounded-full font-semibold"><FaCheck /> {editing ? 'Update Item' : 'Save Item'}</button>
                    {editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...emptyForm, category: selectedCategory }) }} className="px-5 py-2 rounded-full border border-gray-700 text-gray-300">Cancel</button>}
                  </div>
                </form>

                <div className="flex items-center gap-3">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items in this category..." className="input-field flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleItems.map((item) => (
                    <div key={item.name} className={`rounded-2xl border p-4 ${item.available === false ? 'border-gray-800 bg-gray-950 opacity-60' : 'border-gray-800 bg-gray-900/60'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white truncate">{item.name}</h4>
                          <p className="text-primary font-bold mt-1">{item.price}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.bestseller && <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300">Bestseller</span>}
                            {item.special && <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">Chef's Special</span>}
                            <span className={`text-[10px] px-2 py-1 rounded-full ${item.available === false ? 'bg-gray-800 text-gray-500' : 'bg-green-500/10 text-green-300'}`}>{item.available === false ? 'Unavailable' : 'Available'}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => toggleAvailability(item)} className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:text-primary flex items-center justify-center" aria-label="Toggle availability">{item.available === false ? <FaEye /> : <FaEyeSlash />}</button>
                          <button type="button" onClick={() => startEdit(item)} className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:text-primary flex items-center justify-center" aria-label="Edit item"><FaEdit /></button>
                          <button type="button" onClick={() => removeItem(item)} className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:text-red-400 flex items-center justify-center" aria-label="Delete item"><FaTrash /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleItems.length === 0 && <div className="md:col-span-2 rounded-2xl border border-dashed border-gray-800 p-10 text-center text-gray-500">No items found.</div>}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      <style>{`.input-field{width:100%;background:#111827;border:1px solid #374151;border-radius:.75rem;padding:.7rem .9rem;color:#fff;outline:none}.input-field:focus{border-color:#f97316}`}</style>
    </div>
  )
}

export default MenuManagement
