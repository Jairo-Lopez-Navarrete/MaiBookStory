import { useEffect, useState } from 'react'

function BookForm({ book, onAdd, onUpdate, onClose }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')
  const [recommendedBy, setRecommendedBy] = useState('')
  const [genre, setGenre] = useState('')

  const [rating, setRating] = useState(0)
  const [plotRating, setPlotRating] = useState(0)
  const [writingRating, setWritingRating] = useState(0)
  const [contentRating, setContentRating] = useState(0)
  const [readabilityRating, setReadabilityRating] = useState(0)
  const [charactersRating, setCharactersRating] = useState(0)
  const [worldBuildingRating, setWorldBuildingRating] = useState(0)
  const [representationRating, setRepresentationRating] = useState(0)
  const [romanceRating, setRomanceRating] = useState(0)
  const [spiceRating, setSpiceRating] = useState(0)

  const [summary, setSummary] = useState('')
  const [tropes, setTropes] = useState('')
  const [review, setReview] = useState('')
  const [quotes, setQuotes] = useState('')

  const [cover, setCover] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setTitle(book.title || '')
      setAuthor(book.author || '')
      setPages(book.pages || '')
      setRecommendedBy(book.recommended_by || '')
      setGenre(book.genre || '')

      setRating(book.rating || 0)
      setPlotRating(book.plot_rating || 0)
      setWritingRating(book.writing_rating || 0)
      setContentRating(book.content_rating || 0)
      setReadabilityRating(
        book.readability_rating || 0,
      )
      setCharactersRating(
        book.characters_rating || 0,
      )
      setWorldBuildingRating(
        book.world_building_rating || 0,
      )
      setRepresentationRating(
        book.representation_rating || 0,
      )
      setRomanceRating(book.romance_rating || 0)
      setSpiceRating(book.spice_rating || 0)

      setSummary(book.summary || '')
      setTropes(book.tropes || '')
      setReview(book.review || '')
      setQuotes(book.quotes || '')

      setCover(book.cover || '')
      setCoverPreview(book.cover || '')
    } else {
      setTitle('')
      setAuthor('')
      setPages('')
      setRecommendedBy('')
      setGenre('')

      setRating(0)
      setPlotRating(0)
      setWritingRating(0)
      setContentRating(0)
      setReadabilityRating(0)
      setCharactersRating(0)
      setWorldBuildingRating(0)
      setRepresentationRating(0)
      setRomanceRating(0)
      setSpiceRating(0)

      setSummary('')
      setTropes('')
      setReview('')
      setQuotes('')

      setCover('')
      setCoverPreview('')
    }
  }, [book])

  function handleImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Kies een afbeelding.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setCover(reader.result)
      setCoverPreview(reader.result)
    }

    reader.readAsDataURL(file)

    event.target.value = ''
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
      alert('Geef het boek een overall rating.')
      return
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      pages: pages
        ? Number(pages)
        : null,
      recommended_by:
        recommendedBy.trim() || null,
      genre: genre.trim() || null,

      rating,

      plot_rating: plotRating || null,
      writing_rating: writingRating || null,
      content_rating: contentRating || null,
      readability_rating:
        readabilityRating || null,
      characters_rating:
        charactersRating || null,
      world_building_rating:
        worldBuildingRating || null,
      representation_rating:
        representationRating || null,
      romance_rating:
        romanceRating || null,
      spice_rating:
        spiceRating || null,

      summary: summary.trim() || null,
      tropes: tropes.trim() || null,
      review: review.trim() || null,
      quotes: quotes.trim() || null,

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

  function renderStars(value, setValue) {
    return (
      <div className="rating-selector">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            className={
              number <= value
                ? 'rating-star selected'
                : 'rating-star'
            }
            onClick={() => setValue(number)}
            aria-label={`${number} van 5`}
          >
            {number <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
    )
  }

  function renderPeppers(value, setValue) {
    return (
      <div className="rating-selector">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            className={
              number <= value
                ? 'rating-pepper selected'
                : 'rating-pepper'
            }
            onClick={() => setValue(number)}
            aria-label={`${number} van 5 spice`}
          >
            🌶️
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="form-overlay">
      <div className="book-form-container book-detail-form">
        <div className="form-header">
          <button
            type="button"
            className="back-button"
            onClick={onClose}
          >
            ←
          </button>

          <h2>
            {isEditing
              ? 'Boek bewerken'
              : 'Boek toevoegen'}
          </h2>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="book-form"
        >
          <section className="book-top-section">
            <div className="book-cover-column">
              <label
                className="cover-preview large cover-preview-clickable"
                title="Cover kiezen"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Boek cover"
                  />
                ) : (
                  <span>📖</span>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              <div className="overall-rating">
                <h3>Overall rating</h3>

                {renderStars(
                  rating,
                  setRating,
                )}
              </div>
            </div>

            <div className="book-basic-info">
              <div className="form-field">
                <label htmlFor="title">
                  Titel
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="Titel van het boek"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                />
              </div>

              <div className="book-info-row">
                <div className="form-field">
                  <label htmlFor="author">
                    Author
                  </label>

                  <input
                    id="author"
                    type="text"
                    placeholder="Auteur"
                    value={author}
                    onChange={(event) =>
                      setAuthor(event.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pages">
                    Pages
                  </label>

                  <input
                    id="pages"
                    type="number"
                    min="1"
                    placeholder="Aantal"
                    value={pages}
                    onChange={(event) =>
                      setPages(event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="book-info-row">
                <div className="form-field">
                  <label htmlFor="recommendedBy">
                    Recommended by
                  </label>

                  <input
                    id="recommendedBy"
                    type="text"
                    placeholder="Wie raadde het aan?"
                    value={recommendedBy}
                    onChange={(event) =>
                      setRecommendedBy(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="genre">
                    Genre
                  </label>

                  <input
                    id="genre"
                    type="text"
                    placeholder="Genre"
                    value={genre}
                    onChange={(event) =>
                      setGenre(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="book-ratings">
              <h3>Book Ratings</h3>

              <div className="rating-row">
                <span>Plot:</span>
                {renderStars(
                  plotRating,
                  setPlotRating,
                )}
              </div>

              <div className="rating-row">
                <span>Writing:</span>
                {renderStars(
                  writingRating,
                  setWritingRating,
                )}
              </div>

              <div className="rating-row">
                <span>Content:</span>
                {renderStars(
                  contentRating,
                  setContentRating,
                )}
              </div>

              <div className="rating-row">
                <span>Readability:</span>
                {renderStars(
                  readabilityRating,
                  setReadabilityRating,
                )}
              </div>

              <div className="rating-row">
                <span>Characters:</span>
                {renderStars(
                  charactersRating,
                  setCharactersRating,
                )}
              </div>

              <div className="rating-row">
                <span>World building:</span>
                {renderStars(
                  worldBuildingRating,
                  setWorldBuildingRating,
                )}
              </div>

              <div className="rating-row">
                <span>Representation:</span>
                {renderStars(
                  representationRating,
                  setRepresentationRating,
                )}
              </div>

              <div className="rating-row">
                <span>Romance:</span>
                {renderStars(
                  romanceRating,
                  setRomanceRating,
                )}
              </div>

              <div className="rating-row">
                <span>Spice:</span>
                {renderPeppers(
                  spiceRating,
                  setSpiceRating,
                )}
              </div>
            </div>
          </section>

          <section className="book-writing-grid">
            <div className="form-field">
              <label htmlFor="summary">
                Summary
              </label>

              <textarea
                id="summary"
                rows="8"
                placeholder="Schrijf hier je samenvatting..."
                value={summary}
                onChange={(event) =>
                  setSummary(event.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="tropes">
                Tropes
              </label>

              <textarea
                id="tropes"
                rows="8"
                placeholder="Bijvoorbeeld: enemies to lovers, found family..."
                value={tropes}
                onChange={(event) =>
                  setTropes(event.target.value)
                }
              />
            </div>
          </section>

          <div className="form-field">
            <label htmlFor="review">
              Review
            </label>

            <textarea
              id="review"
              rows="10"
              placeholder="Schrijf hier je review..."
              value={review}
              onChange={(event) =>
                setReview(event.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="quotes">
              Quotes
            </label>

            <textarea
              id="quotes"
              rows="8"
              placeholder="Zet hier je favoriete quotes..."
              value={quotes}
              onChange={(event) =>
                setQuotes(event.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="save-book-button"
          >
            {isEditing
              ? 'Wijzigingen opslaan'
              : 'Boek toevoegen'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookForm