import { useEffect, useState } from 'react'

function BookForm({ book, onAdd, onUpdate, onClose }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(0)
  const [cover, setCover] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setRating(book.rating)
      setCover(book.cover)
      setCoverPreview(book.cover)
    } else {
      setTitle('')
      setAuthor('')
      setRating(0)
      setCover('')
      setCoverPreview('')
    }
  }, [book])

  function handleImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setCover(reader.result)
      setCoverPreview(reader.result)
    }

    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Vul een titel in.')
      return
    }

    if (!author.trim()) {
      alert('Vul een auteur in.')
      return
    }

    if (rating === 0) {
      alert('Geef het boek een rating.')
      return
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      rating,
      cover:
        cover ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    }

    if (isEditing) {
      onUpdate({
        ...bookData,
        id: book.id,
      })
    } else {
      onAdd(bookData)
    }
  }

  return (
    <div className="form-overlay">
      <div className="book-form-container">
        <div className="form-header">
          <button className="back-button" onClick={onClose}>
            ←
          </button>

          <h2>{isEditing ? 'Boek bewerken' : 'Boek toevoegen'}</h2>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="cover-upload">
            <div className="cover-preview">
              {coverPreview ? (
                <img src={coverPreview} alt="Boek cover preview" />
              ) : (
                <span>📖</span>
              )}
            </div>

            <label className="upload-button">
              Kies cover
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="title">Titel</label>

            <input
              id="title"
              type="text"
              placeholder="Bijvoorbeeld: Harry Potter"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="author">Auteur</label>

            <input
              id="author"
              type="text"
              placeholder="Bijvoorbeeld: J.K. Rowling"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Mijn rating</label>

            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? 'star selected' : 'star'}
                  onClick={() => setRating(star)}
                  aria-label={`${star} sterren`}
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>

            <p className="rating-text">
              {rating === 0
                ? 'Geef een rating'
                : `${rating} van 5 sterren`}
            </p>
          </div>

          <button type="submit" className="save-book-button">
            {isEditing ? 'Wijzigingen opslaan' : 'Boek toevoegen'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookForm
