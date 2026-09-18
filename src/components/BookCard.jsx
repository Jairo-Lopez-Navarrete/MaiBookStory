import { useRef } from 'react'

function BookCard({ book, onEdit, onDelete }) {
  const pressTimer = useRef(null)
  const longPressTriggered = useRef(false)
  const startPosition = useRef(null)

  function startLongPress(event) {
    longPressTriggered.current = false

    // Bij touch onthouden we waar de vinger begon.
    if (event.touches && event.touches.length > 0) {
      startPosition.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    } else {
      startPosition.current = null
    }

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true

      window.dispatchEvent(
        new CustomEvent('request-book-delete', {
          detail: book,
        }),
      )
    }, 200)
  }

  function cancelLongPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function handleTouchMove(event) {
    if (
      !startPosition.current ||
      !event.touches ||
      event.touches.length === 0
    ) {
      return
    }

    const currentX = event.touches[0].clientX
    const currentY = event.touches[0].clientY

    const moveX =
      Math.abs(
        currentX - startPosition.current.x,
      )

    const moveY =
      Math.abs(
        currentY - startPosition.current.y,
      )

    // Zodra de vinger beweegt, beschouwen we dit
    // als scrollen en annuleren we de long press.
    if (moveX > 10 || moveY > 10) {
      cancelLongPress()
    }
  }

  function handleTouchEnd() {
    cancelLongPress()
    startPosition.current = null
  }

  function handleClick() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    onEdit(book)
  }

  function renderRating(rating) {
    const numericRating = Number(rating) || 0

    return (
      <div
        className="rating"
        aria-label={`Rating: ${numericRating} van 5`}
      >
        {[1, 2, 3, 4, 5].map(
          (starNumber) => {
            const amount =
              numericRating -
              (starNumber - 1)

            if (amount >= 1) {
              return (
                <span
                  key={starNumber}
                  className="rating-star full"
                  aria-hidden="true"
                >
                  ★
                </span>
              )
            }

            if (amount >= 0.5) {
              return (
                <span
                  key={starNumber}
                  className="rating-star half"
                  aria-hidden="true"
                >
                  <span className="rating-star-empty">
                    ☆
                  </span>

                  <span className="rating-star-half">
                    ★
                  </span>
                </span>
              )
            }

            return (
              <span
                key={starNumber}
                className="rating-star empty"
                aria-hidden="true"
              >
                ☆
              </span>
            )
          },
        )}
      </div>
    )
  }

  return (
    <article
      className="book-card"
      onTouchStart={startLongPress}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onClick={handleClick}
    >
      <div className="book-cover">
        <img
          src={book.cover}
          alt={`Cover van ${book.title}`}
          draggable="false"
        />
      </div>

      <div className="book-info">
        {renderRating(book.rating)}

        <h3>{book.title}</h3>

        <p>{book.author}</p>
      </div>
    </article>
  )
}

export default BookCard