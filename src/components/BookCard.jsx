import { useRef } from 'react'

function BookCard({ book, onEdit, onDelete }) {
  const pressTimer = useRef(null)
  const longPressTriggered = useRef(false)

  function startLongPress() {
    longPressTriggered.current = false

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true

      window.dispatchEvent(
        new CustomEvent('request-book-delete', {
          detail: book,
        }),
      )
    }, 200)
  }

  function stopLongPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function handleClick() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    onEdit(book)
  }

  return (
    <article
      className="book-card"
      onTouchStart={startLongPress}
      onTouchEnd={stopLongPress}
      onTouchCancel={stopLongPress}
      onMouseDown={startLongPress}
      onMouseUp={stopLongPress}
      onMouseLeave={stopLongPress}
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
        <div
          className="rating"
          aria-label={`Rating: ${book.rating} van 5`}
        >
          {'★'.repeat(book.rating)}
          {'☆'.repeat(5 - book.rating)}
        </div>

        <h3>{book.title}</h3>

        <p>{book.author}</p>
      </div>
    </article>
  )
}

export default BookCard