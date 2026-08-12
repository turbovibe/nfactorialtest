import { useState, type FormEvent } from 'react';
import { createProduct } from '../lib/actions';
import type { Product } from '../lib/actionTypes';

export function ProductPanel({ organizationId, products, onCreated }: { organizationId: string; products: Product[]; onCreated: () => Promise<void> }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [description, setDescription] = useState(''); const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    try { await createProduct(organizationId, { name: name.trim(), price: Number(price), description: description.trim() }); setName(''); setPrice(''); setDescription(''); await onCreated(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not add product.'); }
  }
  return <section className="panel record-panel"><div className="panel-heading"><div><h2>Product catalog</h2><p>Offers the AI can recommend.</p></div><span>{products.length} items</span></div>
    <form className="compact-form" onSubmit={submit}><input aria-label="Product name" placeholder="Product name" required value={name} onChange={(e) => setName(e.target.value)} /><input aria-label="Price" type="number" min="0" step="0.01" placeholder="Price" required value={price} onChange={(e) => setPrice(e.target.value)} /><input aria-label="Description" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} /><button className="primary-button">Add</button></form>
    {error && <p className="inline-error">{error}</p>}<div className="record-list">{products.map((product) => <div key={product.id}><span><strong>{product.name}</strong><small>{product.description || 'No description'}</small></span><b>${Number(product.price).toFixed(2)}</b></div>)}{!products.length && <p className="list-empty">No products yet.</p>}</div>
  </section>;
}
