import { useState } from "react";
import { clsx } from "clsx";
import ReactConfetti from "react-confetti";
import { languages } from "./language.js";
import { getFarewellText, getRandomWord } from "./utils.js";

function App() {
    // state values
    const [currentWord, setCurrentWord] = useState(() => getRandomWord());
    const [guessedLetters, setGuessedLetters] = useState([]);

    // derived values
    const wrongGuessCount = guessedLetters.filter(
        (letter) => !currentWord.includes(letter)
    ).length;
    const isGameWon = currentWord
        .split("")
        .every((letter) => guessedLetters.includes(letter));
    const numGuessesLeft = languages.length - 1;
    const isGameLost = wrongGuessCount >= numGuessesLeft;
    const isGameOver = isGameWon || isGameLost;
    const lastGuessLetter = guessedLetters[guessedLetters.length - 1];
    const lastGuessIncorrect =
        lastGuessLetter && !currentWord.includes(lastGuessLetter);

    // static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function addGuessedLetter(letter) {
        setGuessedLetters((prevLetters) =>
            prevLetters.includes(letter)
                ? prevLetters
                : [...prevLetters, letter]
        );
    }

    function startNewGame() {
        setCurrentWord(getRandomWord());
        setGuessedLetters([]);
    }

    const languageElements = languages.map((language, index) => {
        const isLanguageLost = index < wrongGuessCount;
        const styles = {
            backgroundColor: language.backgroundColor,
            color: language.color,
        };

        const className = clsx("chip", isLanguageLost && "lost");

        return (
            <span key={language.name} className={className} style={styles}>
                {language.name}
            </span>
        );
    });

    const letterElements = currentWord.split("").map((letter, index) => {
        const styles =
            isGameLost && !guessedLetters.includes(letter)
                ? { color: "#EC5D49" }
                : null;
        return (
            <span key={index} style={styles}>
                {guessedLetters.includes(letter)
                    ? letter.toUpperCase()
                    : isGameLost && letter.toUpperCase()}
            </span>
        );
    });

    const keyboardElements = alphabet.split("").map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        const isCorrect = isGuessed && currentWord.includes(letter);
        const isWrong = isGuessed && !currentWord.includes(letter);
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong,
        });

        return (
            <button
                key={letter}
                className={className}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        );
    });

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && lastGuessIncorrect,
    });

    function renderGameStatus() {
        if (!isGameOver && lastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1].name)}
                </p>
            );
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            );
        }

        if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            );
        }

        return null;
    }

    return (
        <main>
            {isGameWon && (
                <ReactConfetti recycle={false} numberOfPieces={1000} />
            )}
            <header>
                <h1>Assembly: Endgame</h1>
                <p>
                    Guess the word in under 8 attempts to keep the programming
                    world safe from Assembly!
                </p>
            </header>

            <section
                className={gameStatusClass}
                aria-live="polite"
                role="status"
            >
                {renderGameStatus()}
            </section>

            <section className="language-chips">{languageElements}</section>

            <section className="word">{letterElements}</section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <section className="sr-only" aria-live="polite" role="status">
                <p>
                    {currentWord.includes(lastGuessLetter)
                        ? `Correct! The letter ${lastGuessLetter} is in the word.`
                        : `Sorry, the letter ${lastGuessLetter} is not in the word.`}
                    You have {numGuessesLeft - wrongGuessCount} attempts left.
                </p>

                <p>
                    Current word:{" "}
                    {currentWord
                        .split("")
                        .map((letter) =>
                            guessedLetters.includes(letter)
                                ? letter + "."
                                : "blank."
                        )
                        .join(" ")}
                </p>
            </section>

            <section className="keyboard">{keyboardElements}</section>

            {isGameOver && (
                <button className="new-game" onClick={startNewGame}>
                    New Game
                </button>
            )}
        </main>
    );
}

export default App;
