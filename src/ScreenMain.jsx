import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './images/logo.png';
import { jobTitles, locations, backgroundImages } from './scripts/Jobs';

const getRandomIndex = (array) => Math.floor(Math.random() * array.length);

const ScreenMain = () => {
    const navigate = useNavigate();

    const [typedText, setTypedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(getRandomIndex(jobTitles)); // Random job title
    const [locationIndex, setLocationIndex] = useState(getRandomIndex(locations)); // Random location
    const [charIndex, setCharIndex] = useState(0); // Track the current character index
    const [isInputFocused, setIsInputFocused] = useState(false); // Track if input is focused
    const [isReadOnly, setIsReadOnly] = useState(true); // Stop typing animation while input is focused
    const [cursorVisible, setCursorVisible] = useState(true); // Track visibility of the cursor
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const typingSpeed = 100;  // Speed of typing each character in ms
    const eraseSpeed = 80;    // Speed of erasing characters in ms
    const delayBetweenWords = 1000; // Delay before starting the next word
    const cursorBlinkInterval = 500; // Blink interval for the cursor (ms)
    const [searchQuery, setSearchQuery] = useState('');

    const updatePlaceholderText = () => {
        const jobTitle = jobTitles[currentIndex];
        const location = locations[locationIndex];
        return `${jobTitle} in ${location}`;
    };

    // Preload images
    useEffect(() => {
        const preloadImages = () => {
            backgroundImages.forEach((image) => {
                const img = new Image();
                img.src = image;
            });
        };
        preloadImages();
    }, []); // Run once on component mount

    useEffect(() => {
        const typingEffect = () => {
            if (isInputFocused) return; // Stop typing when the input is focused

            const placeholderText = updatePlaceholderText();
            if (charIndex < placeholderText.length + 3) { // Length of the text + '...'
                if (charIndex < placeholderText.length) {
                    setTypedText((prev) => prev + placeholderText[charIndex]);
                } else {
                    setTypedText((prev) => prev + '.'); // Add '...'
                }
                setCharIndex(charIndex + 1);
            } else {
                setTimeout(() => {
                    setTypedText('');
                    setCharIndex(0);
                    setCurrentIndex(getRandomIndex(jobTitles));
                    setLocationIndex(getRandomIndex(locations));
                }, delayBetweenWords);
            }
        };

        const timeout = setTimeout(typingEffect, isReadOnly ? typingSpeed : eraseSpeed);
        return () => clearTimeout(timeout);
    }, [charIndex, currentIndex, locationIndex, isReadOnly, isInputFocused]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            if (!isInputFocused) {
                setCursorVisible((prev) => !prev); // Blink cursor only if input is not focused
            }
        }, cursorBlinkInterval);

        return () => clearInterval(cursorInterval);
    }, [isInputFocused]);

    const goToAnotherPage = () => {
        if (searchQuery.trim() !== '') {
            console.log('Navigating to /search with query:', searchQuery);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        } else {
            console.log('Search query is empty, cannot navigate.');
        }
    };

    const handleFocus = () => {
        setIsInputFocused(true);
        setIsReadOnly(false);
        setTypedText('');
    };

    const handleBlur = () => {
        setIsInputFocused(false);
        setIsReadOnly(true);
        setCharIndex(0);
        setTypedText('');
    };

    return (
        <div
            className="relative min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-black font-sans"
            style={{
                backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
                transition: 'background-image 1s ease-in-out',
            }}
        >
            <div className="w-full h-[5%] bg-white p-2 shadow-md fixed top-0 left-0 right-0 z-10 items-center align-middle flex justify-center"></div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-0"></div>

            <div className="flex flex-col justify-center items-center w-full mb-24 z-10">
                <div
                    onClick={goToAnotherPage}
                    className="cursor-pointer rounded-2xl shadow flex justify-center items-center"
                    style={{
                        backgroundColor: 'white',
                        position: 'relative',
                        width: '50vw',
                        height: '50vw',
                        maxWidth: '30em',
                        maxHeight: '30em',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        className="relative"
                        style={{
                            backgroundImage: `url(${logo})`,
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-10 space-y-4 z-10">
                    <p
                        style={{ letterSpacing: '3px' }}
                        className="text-3xl  font-semibold text-center text-white bg-black/50 p-2 rounded-lg shadow-md w-[60%] mb-4"
                    >
                        Search for Job Skills by Job
                    </p>

                    <div className="flex ml-24 items-center justify-center space-x-4 mt-4">
                        <input
                            type="text"
                            value={searchQuery}
                            placeholder={typedText + (cursorVisible && !isInputFocused ? '|' : '')}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-3 rounded-3xl text-5xl bg-white text-black w-[75%] sm:w-[50vw] shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-center"
                            style={{ textAlign: 'center' }}
                            readOnly={isReadOnly}
                        />
                        <button
                            onClick={goToAnotherPage}
                            className="text-2xl shadow-xl bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full h-[5%] bg-white p-2 shadow-md fixed bottom-0 left-0 right-0 flex justify-center items-center align-middle z-10">
                <span className='italic'> *This site aims to make people aware of the most common skills needed for their jobs and the sources to learn them*</span>
            </div>
        </div>
    );
};

export default ScreenMain;
