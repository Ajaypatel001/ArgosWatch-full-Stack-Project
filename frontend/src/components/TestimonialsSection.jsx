import { useState, useEffect } from 'react';
import { Star, Send, ChevronLeft, ChevronRight } from 'lucide-react';

const initialTestimonials = [];
export default function TestimonialsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [current, setCurrent] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ name: '', location: '', crop: '', rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/testimonials')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load testimonials');
        setTestimonials([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (showForm || testimonials.length === 0) return;
    const timer = setInterval(() => {
      goToNext();
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, testimonials.length, showForm]);

  const goTo = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => goTo((current + 1) % testimonials.length);
  const goToPrev = () => goTo((current - 1 + testimonials.length) % testimonials.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim() || form.rating === 0) return;
    
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Failed to submit');
      const data = await response.json();
      const newList = [{ id: data.id, ...form }, ...testimonials];
      setTestimonials(newList);
      setCurrent(0);
      setForm({ name: '', location: '', crop: '', rating: 0, comment: '' });
      setHoverRating(0);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    }
  };

const avgRating = testimonials.length > 0 
  ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
  : 0;
  const item = testimonials[current];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Farmers Say</h2>
          <p className="text-gray-500 mt-1">Real stories from real farmers using AgroWatch</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-yellow-700">{avgRating}</span>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {testimonials.length}+ Reviews
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-farm-green-600 hover:bg-farm-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            <Send className="w-3.5 h-3.5" />
            Write Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-farm-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-farm-green-600 fill-farm-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Thank you for your review!</p>
              <p className="text-gray-500 text-sm mt-1">Your feedback helps other farmers</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 transition-colors ${star <= (hoverRating || form.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500 self-center">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Punjab" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <input type="text" value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} placeholder="e.g. Wheat" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
                <textarea required rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Share your experience with AgroWatch..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setForm({ name: '', location: '', crop: '', rating: 0, comment: '' }); setHoverRating(0); }} className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={form.rating === 0} className="px-5 py-2.5 bg-farm-green-600 hover:bg-farm-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full text-sm font-semibold transition-colors">Submit Review</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Single Testimonial Slideshow */}
{loading ? (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600 mx-auto mb-4"></div>
    <p className="text-gray-500">Loading testimonials...</p>
  </div>
) : error ? (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">{error}</p>
  </div>
) : testimonials.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 relative overflow-hidden">
          {/* Card Content with transition */}
          <div className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6 italic">
              "{item.comment}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-farm-green-50 border border-farm-green-100 flex items-center justify-center text-base font-bold text-farm-green-700">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-gray-400 text-sm">
                  {item.location && item.crop ? `${item.location} · ${item.crop} Farmer` : item.location || item.crop || 'Farmer'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4">
            <button onClick={goToPrev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4">
            <button onClick={goToNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No testimonials yet. Be the first to share your story!</p>
        </div>
      )}

      {/* Dots indicator */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === current ? 'bg-farm-green-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
