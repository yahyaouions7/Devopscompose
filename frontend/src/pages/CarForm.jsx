import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { imageUrl } from '../api.js';

export default function CarForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', brand: '', price: '', year: '', description: '' });
  const [existing, setExisting] = useState([]); // images déjà enregistrées
  const [removed, setRemoved] = useState([]); // images à supprimer
  const [files, setFiles] = useState([]); // nouvelles images
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/cars/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          brand: data.brand || '',
          price: data.price ?? '',
          year: data.year || '',
          description: data.description || '',
        });
        setExisting(data.images || []);
      })
      .catch(() => setError('Voiture introuvable'));
  }, [id, isEdit]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleRemove = (img) =>
    setRemoved((prev) => (prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    files.forEach((f) => data.append('images', f));
    if (isEdit) data.append('removeImages', JSON.stringify(removed));

    try {
      if (isEdit) await api.put(`/cars/${id}`, data);
      else await api.post('/cars', data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{isEdit ? 'Modifier la voiture' : 'Ajouter une voiture'}</h2>
      {error && <div className="alert">{error}</div>}

      <label>
        Nom *
        <input name="name" value={form.name} onChange={change} required />
      </label>
      <label>
        Marque
        <input name="brand" value={form.brand} onChange={change} />
      </label>
      <div className="row">
        <label>
          Prix (DT) *
          <input name="price" type="number" min="0" value={form.price} onChange={change} required />
        </label>
        <label>
          Année
          <input name="year" type="number" min="1900" max="2100" value={form.year} onChange={change} />
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows="3" value={form.description} onChange={change} />
      </label>

      {isEdit && existing.length > 0 && (
        <div>
          <p className="label">Images actuelles (clique pour supprimer)</p>
          <div className="thumbs-edit">
            {existing.map((img) => (
              <div
                key={img}
                className={`thumb ${removed.includes(img) ? 'removed' : ''}`}
                onClick={() => toggleRemove(img)}
                title={removed.includes(img) ? 'Annuler la suppression' : 'Supprimer'}
              >
                <img src={imageUrl(img)} alt="" />
                {removed.includes(img) && <span>✕</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <label>
        {isEdit ? 'Ajouter des images' : 'Images'}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
        />
      </label>

      {files.length > 0 && (
        <div className="thumbs-edit">
          {files.map((f, i) => (
            <div key={i} className="thumb">
              <img src={URL.createObjectURL(f)} alt="" />
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={() => navigate('/')}>Annuler</button>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? '...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
