import { useEffect, useState } from "react"
import { color, motion } from "framer-motion"

const App = () => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [showModal, setShowModal] = useState(false);

  const addColumn = () => {
    setShowModal(true)
    // setColumns((prev) => [...prev, { title: "New Column", id: "9", column: "board_4" }])
  }
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board columns={columns} />
      <button className="fixed right-10 top-10 flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xxl text-neutral-950 transition-colors hover:bg-neutral-300"
        onClick={() => addColumn()}>Add Column</button>
      {showModal && <Modal />}
    </div>
  )
}

const TrashBin = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    setActive(false);
  }

  return (
    <>
      <div className={`trash_bin ${active ? "avtive" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDragEnd}>BIN</div>
    </>
  )
}

const Modal = ({ setTitle }) => {
  return (
    <div className="fixed inset-0 overflow-y-auto z-50 bg-opacity-75 backdrop-blur-sm flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col w-full max-w-sm">
        <h5 className="text-xl font-medium mb-2 text-neutral-500">Add Item</h5>
        <input
          type="text"
          placeholder="Enter Item Title"
          // value={title}
          // onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md focus:outline-none hover:bg-gray-300"
          // onClick={handleClose}
          >
            Close
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none hover:bg-blue-700 disabled:opacity-50"
          // onClick={handleAdd}
          // disabled={!title}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

const Board = ({ columns }) => {
  const myCards = JSON.parse(localStorage.getItem("cards")) || DEFAULT_CARDS
  const [cards, setCards] = useState(myCards)
  return (
    <div className="flex h-full w-full gap-3 overflow-auto p-12">
      {columns && columns.map((d, i) =>
        <Columns title={d.title} cards={cards} setCards={setCards} color={"text-neutral-500"} column={d.column} key={i} />
      )}
      <TrashBin setCards={setCards} />
    </div>
  )
}

const Card = ({ title, id, column, handleDragStart }) => {
  return (
    <>
      <Indicator column={column} beforeId={id} />
      <motion.div layout layoutId={id} className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing" draggable={true} onDragStart={(e) => handleDragStart(e, { title: title, id: id, column: column })}>
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  )
}

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("")
  const [adding, setAdding] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text === "" || !text.trim().length) return setAdding(false);
    const newCard = {
      column: column, title: text.trim(), id: Math.random().toFixed(2).toString()
    };
    setCards((prev) => [...prev, newCard]);
    return setAdding(false)
  }

  return (
    <>
      {adding ?
        <>
          <motion.form layout onSubmit={handleSubmit}>
            <textarea name="cardForm" onChange={(e) => setText(e.target.value)} autoFocus className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0" placeholder="Add something..." />
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <button type="reset" className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50" onClick={() => setAdding(false)}>close</button>
              <button type="submit" className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300">Add +</button>
            </div>
          </motion.form>
        </> :
        <motion.button layout onClick={() => setAdding(true)} className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-color hover:text-neutral-50`}><span>Add card</span>+</motion.button>
      }
    </>
  )
}

const Indicator = ({ beforeId, column }) => {
  return (
    <div className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
      data-before={beforeId || "-1"}
      data-column={column} />
  )
}

const Columns = ({ title, color, column, cards, setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    return e.dataTransfer.setData("cardId", card.id);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e)
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
    clearIndicators()
  }

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setActive(false);
    clearIndicators()
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let cardCopy = [...cards];
      let cardToTransfer = cardCopy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column }
      cardCopy = cardCopy.filter((c) => c.id !== cardId);
      const moveToBack = before === "-1"
      if (moveToBack) {
        cardCopy.push(cardToTransfer);
      } else {
        const insertAt = cardCopy.findIndex((e) => e.id === before);
        if (insertAt === undefined) return;
        cardCopy.splice(insertAt, 0, cardToTransfer)
      }
      setCards(cardCopy)
      localStorage.setItem("cards", JSON.stringify(cardCopy))
    }
  }

  const highlightIndicator = (e) => {
    const indicators = getIndicators()
    clearIndicators(indicators)
    const element = getNearestIndicator(e, indicators)
    element.element.style.opacity = "1";
  }

  function getIndicators() {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`))
  }

  function getNearestIndicator(e, indicators) {
    const element = indicators.reduce((a, c) => {
      const box = c.getBoundingClientRect();
      const offset = e.clientY - (box.top + 50);

      if (offset < 0 && offset > a.offset) {
        return { offset: offset, element: c }
      } else {
        return a;
      }

    }, {
      offset: Number.NEGATIVE_INFINITY,
      element: indicators[indicators.length - 1]
    });
    return element;
  }

  function clearIndicators(elems) {
    const indicators = elems || getIndicators();
    indicators.forEach((e) => {
      e.style.opacity = "0"
    })
  }

  const filteredCards = cards.filter((i) => i.column === column);

  return (
    <>
      <div className="w-56 shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`font-medium ` + color}>{title}</h3>
          <span className="rounded text-sm text-neutral-400">
            {filteredCards.length}
          </span>
        </div>
        <div className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDragEnd}
        >
          {filteredCards.map((data) => {
            return <Card {...data} key={data.id} handleDragStart={handleDragStart} />
          })}
          <Indicator beforeId={null} column={column} />
          <AddCard setCards={setCards} column={column} />
        </div>
      </div>
    </>
  )
};

const DEFAULT_CARDS = [
  { title: "Card 1", id: "1", column: "board_1" },
  { title: "Card 2", id: "2", column: "board_2" },
  { title: "Card 3", id: "3", column: "board_1" },
  { title: "Card 4", id: "4", column: "board_1" },
  { title: "Card 5", id: "5", column: "board_2" },
  { title: "Card 6", id: "6", column: "board_1" },
  { title: "Card 7", id: "7", column: "board_2" },
  { title: "Card 8", id: "8", column: "board_2" },
  { title: "Card 9", id: "9", column: "board_1" },
];

const DEFAULT_COLUMNS = [
  { title: "Board 1", column: "board_1" },
  { title: "Board 2", column: "board_2" }
]

export default App;