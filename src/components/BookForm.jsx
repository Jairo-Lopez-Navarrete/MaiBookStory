import { useEffect, useRef, useState } from 'react'

const monthNames = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function BookForm({
  book,
  selectedMonth,
  selectedYear,
  onAdd,
  onUpdate,
  onClose,
}) {
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
  const [worldBuildingRating, setWorldBuildingRating] =
    useState(0)
  const [representationRating, setRepresentationRating] =
    useState(0)
  const [romanceRating, setRomanceRating] = useState(0)
  const [spiceRating, setSpiceRating] = useState(0)

  const [owned, setOwned] = useState(false)

  const [summary, setSummary] = useState('')
  const [tropes, setTropes] = useState('')
  const [review, setReview] = useState('')
  const [quotes, setQuotes] = useState('')

  const [cover, setCover] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  const ratingPointer = useRef(null)

  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setTitle(book.title || '')
      setAuthor(book.author || '')
      setPages(book.pages || '')
      setRecommendedBy(book.recommended_by || '')
      setGenre(book.genre || '')

      setRating(Number(book.rating) || 0)
      setPlotRating(Number(book.plot_rating) || 0)
      setWritingRating(Number(book.writing_rating) || 0)
      setContentRating(Number(book.content_rating) || 0)
      setReadabilityRating(
        Number(book.readability_rating) || 0,
      )
      setCharactersRating(
        Number(book.characters_rating) || 0,
      )
      setWorldBuildingRating(
        Number(book.world_building_rating) || 0,
      )
      setRepresentationRating(
        Number(book.representation_rating) || 0,
      )
      setRomanceRating(Number(book.romance_rating) || 0)
      setSpiceRating(Number(book.spice_rating) || 0)

      setOwned(Boolean(book.owned))

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

      setOwned(false)

      setSummary('')
      setTropes('')
      setReview('')
      setQuotes('')

      setCover('')
      setCoverPreview('')
    }
  }, [book])

  function getExistingBookPeriod() {
    if (
      book?.reading_month &&
      book?.reading_year
    ) {
      return {
        month: Number(book.reading_month),
        year: Number(book.reading_year),
      }
    }

    if (book?.created_at) {
      const date = new Date(book.created_at)

      return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      }
    }

    return {
      month: selectedMonth,
      year: selectedYear,
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

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

    const existingPeriod = getExistingBookPeriod()

    const bookData = {
      title: title.trim(),
      author: author.trim(),

      pages: pages
        ? Number(pages)
        : null,

      recommended_by:
        recommendedBy.trim() || null,

      genre:
        genre.trim() || null,

      rating,

      plot_rating: plotRating,
      writing_rating: writingRating,
      content_rating: contentRating,
      readability_rating: readabilityRating,
      characters_rating: charactersRating,
      world_building_rating: worldBuildingRating,
      representation_rating: representationRating,
      romance_rating: romanceRating,
      spice_rating: spiceRating,

      owned,

      summary:
        summary.trim() || null,

      tropes:
        tropes.trim() || null,

      review:
        review.trim() || null,

      quotes:
        quotes.trim() || null,

      cover:
        cover ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',

      reading_month: isEditing
        ? existingPeriod.month
        : selectedMonth,

      reading_year: isEditing
        ? existingPeriod.year
        : selectedYear,
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

  function getRatingFromPointer(
    event,
    container,
    step,
  ) {
    const rect =
      container.getBoundingClientRect()

    if (!rect.width) {
      return 0
    }

    const position =
      event.clientX - rect.left

    const percentage =
      Math.max(
        0,
        Math.min(
          1,
          position / rect.width,
        ),
      )

    const rawValue = percentage * 5

    return Math.max(
      0,
      Math.min(
        5,
        Math.round(rawValue / step) * step,
      ),
    )
  }

  function updateRatingFromPointer(
    event,
    container,
    setValue,
    step,
  ) {
    const nextValue =
      getRatingFromPointer(
        event,
        container,
        step,
      )

    setValue(nextValue)
  }

  function handleRatingPointerDown(
    event,
    setValue,
    step,
  ) {
    const container =
      event.currentTarget

    ratingPointer.current = {
      container,
      setValue,
      step,
    }

    container.setPointerCapture?.(
      event.pointerId,
    )

    updateRatingFromPointer(
      event,
      container,
      setValue,
      step,
    )
  }

  function handleRatingPointerMove(
    event,
  ) {
    const active =
      ratingPointer.current

    if (!active) {
      return
    }

    updateRatingFromPointer(
      event,
      active.container,
      active.setValue,
      active.step,
    )
  }

  function handleRatingPointerUp(event) {
    const active =
      ratingPointer.current

    if (!active) {
      return
    }

    active.container.releasePointerCapture?.(
      event.pointerId,
    )

    ratingPointer.current = null
  }

  function handleRatingPointerCancel() {
    ratingPointer.current = null
  }

  function renderStars(value, setValue) {
    return (
      <div
        className="journal-rating-stars"
        onPointerDown={(event) =>
          handleRatingPointerDown(
            event,
            setValue,
            0.5,
          )
        }
        onPointerMove={
          handleRatingPointerMove
        }
        onPointerUp={
          handleRatingPointerUp
        }
        onPointerCancel={
          handleRatingPointerCancel
        }
        onPointerLeave={
          handleRatingPointerCancel
        }
        role="slider"
        aria-valuemin="0"
        aria-valuemax="5"
        aria-valuenow={value}
        aria-label={`Rating ${value} van 5`}
      >
        {[1, 2, 3, 4, 5].map(
          (number) => {
            const fill = Math.max(
              0,
              Math.min(
                1,
                value - (number - 1),
              ),
            )

            return (
              <span
                key={number}
                className="journal-star"
                aria-hidden="true"
              >
                <span className="journal-star-empty">
                  ☆
                </span>

                {fill > 0 && (
                  <span
                    className="journal-star-fill"
                    style={{
                      width: `${fill * 100}%`,
                    }}
                  >
                    ★
                  </span>
                )}
              </span>
            )
          },
        )}
      </div>
    )
  }

  function renderPeppers(value, setValue) {
    return (
      <div
        className="journal-rating-stars journal-peppers"
        onPointerDown={(event) =>
          handleRatingPointerDown(
            event,
            setValue,
            1,
          )
        }
        onPointerMove={
          handleRatingPointerMove
        }
        onPointerUp={
          handleRatingPointerUp
        }
        onPointerCancel={
          handleRatingPointerCancel
        }
        onPointerLeave={
          handleRatingPointerCancel
        }
        role="slider"
        aria-valuemin="0"
        aria-valuemax="5"
        aria-valuenow={value}
        aria-label={`Spice ${value} van 5`}
      >
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <span
              key={number}
              className="journal-pepper"
              aria-hidden="true"
            >
              <span className="journal-pepper-empty">
                🌶️
              </span>

              {value >= number && (
                <span className="journal-pepper-fill">
                  🌶️
                </span>
              )}
            </span>
          ),
        )}
      </div>
    )
  }

  const displayMonth = isEditing
    ? getExistingBookPeriod().month
    : selectedMonth

  const displayYear = isEditing
    ? getExistingBookPeriod().year
    : selectedYear

  return (
    <div className="journal-form-overlay">
      <div className="journal-book-form">
        <header className="journal-form-header">
          <div className="journal-form-header-stars">
            ✦ ✧
          </div>

          <button
            type="button"
            className="journal-form-back"
            onClick={onClose}
          >
            ←
          </button>

          <div className="journal-form-heading">
            <span>
              {isEditing
                ? 'my reading journal'
                : 'new book'}
            </span>

            <h2>book review</h2>

            <p>
              {isEditing
                ? 'edit & keep track of your book'
                : 'add a new book to your library'}
            </p>
          </div>

          <button
            type="button"
            className="journal-form-close"
            onClick={onClose}
            aria-label="Sluiten"
          >
            ×
          </button>
        </header>

        <div className="journal-form-period">
          <span>reading month</span>

          <strong>
            {monthNames[displayMonth - 1]}
          </strong>

          <em>{displayYear}</em>
        </div>

        <form
          onSubmit={handleSubmit}
          className="journal-book-form-content"
        >
          <section className="journal-review-main">
            <div className="journal-cover-section">
              <label
                className="journal-cover-frame"
                title="Cover kiezen"
              >
                {coverPreview ? (
                  <img
  src={book.cover}
  alt={`Cover van ${book.title}`}
  draggable="false"
/>
                ) : (
                  <div className="journal-cover-placeholder">
                    📖
                    <span>
                      insert
                      <br />
                      book cover
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />
              </label>

              <div className="journal-overall">
                <span>overall rating</span>

                {renderStars(
                  rating,
                  setRating,
                )}
              </div>
            </div>

            <div className="journal-book-details">
              <div className="journal-field">
                <label htmlFor="title">
                  title
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="Book title"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="journal-two-fields">
                <div className="journal-field">
                  <label htmlFor="author">
                    author
                  </label>

                  <input
                    id="author"
                    type="text"
                    placeholder="Author"
                    value={author}
                    onChange={(event) =>
                      setAuthor(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="journal-field">
                  <label htmlFor="pages">
                    nr. of pages
                  </label>

                  <input
                    id="pages"
                    type="number"
                    min="1"
                    placeholder="Pages"
                    value={pages}
                    onChange={(event) =>
                      setPages(
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="journal-two-fields">
                <div className="journal-field">
                  <label htmlFor="recommendedBy">
                    recommended by
                  </label>

                  <input
                    id="recommendedBy"
                    type="text"
                    placeholder="Who recommended it?"
                    value={recommendedBy}
                    onChange={(event) =>
                      setRecommendedBy(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="journal-field">
                  <label htmlFor="genre">
                    genre
                  </label>

                  <input
                    id="genre"
                    type="text"
                    placeholder="Genre"
                    value={genre}
                    onChange={(event) =>
                      setGenre(
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <label className="journal-owned-toggle">
                <input
                  type="checkbox"
                  checked={owned}
                  onChange={(event) =>
                    setOwned(
                      event.target.checked,
                    )
                  }
                />

                <span className="journal-owned-checkbox">
                  {owned ? '✓' : ''}
                </span>

                <span className="journal-owned-text">
                  <strong>Owned</strong>
                </span>
              </label>

              <div className="journal-read-info">
                <span>reading month</span>

                <strong>
                  {
                    monthNames[
                      displayMonth - 1
                    ]
                  }{' '}
                  {displayYear}
                </strong>
              </div>
            </div>

            <aside className="journal-ratings-panel">
              <div className="journal-panel-title">
                <span>book ratings</span>

                <small>
                  rate your reading
                </small>
              </div>

              <div className="journal-rating-row">
                <span>plot</span>

                {renderStars(
                  plotRating,
                  setPlotRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>writing</span>

                {renderStars(
                  writingRating,
                  setWritingRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>content</span>

                {renderStars(
                  contentRating,
                  setContentRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>readability</span>

                {renderStars(
                  readabilityRating,
                  setReadabilityRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>characters</span>

                {renderStars(
                  charactersRating,
                  setCharactersRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>world building</span>

                {renderStars(
                  worldBuildingRating,
                  setWorldBuildingRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>romance</span>

                {renderStars(
                  romanceRating,
                  setRomanceRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>spice</span>

                {renderPeppers(
                  spiceRating,
                  setSpiceRating,
                )}
              </div>
            </aside>
          </section>

          <section className="journal-writing-columns">
            <div className="journal-writing-card">
              <div className="journal-writing-title">
                <span>01</span>
                <h3>summary</h3>
              </div>

              <textarea
                id="summary"
                rows="8"
                placeholder="Write your summary here..."
                value={summary}
                onChange={(event) =>
                  setSummary(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="journal-writing-card">
              <div className="journal-writing-title">
                <span>02</span>
                <h3>tropes</h3>
              </div>

              <textarea
                id="tropes"
                rows="8"
                placeholder="Enemies to lovers, found family..."
                value={tropes}
                onChange={(event) =>
                  setTropes(
                    event.target.value,
                  )
                }
              />
            </div>
          </section>

          <section className="journal-writing-card journal-review-card">
            <div className="journal-writing-title">
              <span>03</span>
              <h3>review</h3>
            </div>

            <textarea
              id="review"
              rows="10"
              placeholder="Write your review here..."
              value={review}
              onChange={(event) =>
                setReview(
                  event.target.value,
                )
              }
            />
          </section>

          <section className="journal-writing-card journal-quotes-card">
            <div className="journal-writing-title">
              <span>04</span>
              <h3>quotes</h3>
            </div>

            <textarea
              id="quotes"
              rows="8"
              placeholder="Write your favourite quotes here..."
              value={quotes}
              onChange={(event) =>
                setQuotes(
                  event.target.value,
                )
              }
            />
          </section>

          <button
            type="submit"
            className="journal-save-button"
          >
            <span>✦</span>

            {isEditing
              ? 'save changes'
              : 'add book'}

            <span>✦</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookForm