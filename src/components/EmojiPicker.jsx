import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    MdSearch,
    MdSentimentSatisfiedAlt,
    MdPets,
    MdRestaurant,
    MdSportsSoccer,
    MdFlight,
    MdLightbulb,
    MdFavorite,
    MdHistory,
    MdClose,
} from "react-icons/md";

// Comprehensive categorized emoji dataset with search tags
const EMOJI_CATEGORIES = [
    {
        id: "smileys",
        name: "Smileys & Emotion",
        icon: MdSentimentSatisfiedAlt,
        emojis: [
            { char: "😀", tags: ["grinning", "smile", "happy"] },
            { char: "😃", tags: ["smiley", "happy", "joy"] },
            { char: "😄", tags: ["smile", "happy", "laugh"] },
            { char: "😁", tags: ["beam", "grin", "smile"] },
            { char: "😆", tags: ["laugh", "closed eyes", "happy"] },
            { char: "😅", tags: ["sweat", "smile", "relief"] },
            { char: "🤣", tags: ["rofl", "rolling", "laughing"] },
            { char: "😂", tags: ["joy", "tears", "laugh"] },
            { char: "🙂", tags: ["slightly smiling", "smile"] },
            { char: "🙃", tags: ["upside-down", "silly"] },
            { char: "😉", tags: ["wink", "flirt"] },
            { char: "😊", tags: ["blush", "smile", "proud"] },
            { char: "😇", tags: ["angel", "halo", "innocent"] },
            { char: "🥰", tags: ["love", "hearts", "adore"] },
            { char: "😍", tags: ["heart eyes", "love", "crush"] },
            { char: "🤩", tags: ["star struck", "excited"] },
            { char: "😘", tags: ["kiss", "love", "blow kiss"] },
            { char: "😗", tags: ["kissing", "whistle"] },
            { char: "😋", tags: ["yum", "delicious", "tongue"] },
            { char: "😛", tags: ["tongue", "playful"] },
            { char: "😜", tags: ["wink tongue", "crazy", "silly"] },
            { char: "🤪", tags: ["zany", "wild", "crazy"] },
            { char: "😝", tags: ["squint tongue", "prank"] },
            { char: "🤑", tags: ["money", "rich", "dollar"] },
            { char: "🤗", tags: ["hug", "open hands"] },
            { char: "🤭", tags: ["giggle", "blushing", "oops"] },
            { char: "🤫", tags: ["shh", "quiet", "silence"] },
            { char: "🤔", tags: ["thinking", "ponder", "hmm"] },
            { char: "🤐", tags: ["zipper", "silent", "secret"] },
            { char: "🤨", tags: ["raised eyebrow", "suspicious"] },
            { char: "😐", tags: ["neutral", "poker face"] },
            { char: "😑", tags: ["expressionless", "bored"] },
            { char: "😶", tags: ["no mouth", "speechless"] },
            { char: "😏", tags: ["smirk", "flirt", "clever"] },
            { char: "😒", tags: ["unamused", "meh", "bored"] },
            { char: "🙄", tags: ["eye roll", "annoyed"] },
            { char: "😬", tags: ["grimace", "awkward"] },
            { char: "🤥", tags: ["lying", "pinocchio"] },
            { char: "😌", tags: ["relieved", "zen", "peace"] },
            { char: "😔", tags: ["pensive", "sad", "down"] },
            { char: "😪", tags: ["sleepy", "tired"] },
            { char: "🤤", tags: ["drool", "hungry"] },
            { char: "😴", tags: ["sleeping", "zzz"] },
            { char: "😷", tags: ["mask", "sick"] },
            { char: "🤒", tags: ["thermometer", "fever"] },
            { char: "🤕", tags: ["bandage", "hurt"] },
            { char: "🤢", tags: ["nauseated", "gross"] },
            { char: "🤮", tags: ["vomit", "sick"] },
            { char: "🤧", tags: ["sneeze", "cold"] },
            { char: "🥵", tags: ["hot", "sweating"] },
            { char: "🥶", tags: ["cold", "freezing"] },
            { char: "🥴", tags: ["woozy", "dizzy"] },
            { char: "😵", tags: ["dizzy", "knocked out"] },
            { char: "🤯", tags: ["mind blown", "shock"] },
            { char: "🤠", tags: ["cowboy", "hat"] },
            { char: "🥳", tags: ["party", "celebrate"] },
            { char: "😎", tags: ["cool", "sunglasses"] },
            { char: "🤓", tags: ["nerd", "geek", "glasses"] },
            { char: "🧐", tags: ["monocle", "curious"] },
            { char: "😕", tags: ["confused", "unsure"] },
            { char: "😟", tags: ["worried", "nervous"] },
            { char: "😮", tags: ["surprised", "gasp"] },
            { char: "😲", tags: ["astonished", "wow"] },
            { char: "😳", tags: ["flushed", "embarrassed"] },
            { char: "🥺", tags: ["pleading", "puppy eyes", "beg"] },
            { char: "😦", tags: ["frown", "sad"] },
            { char: "😨", tags: ["scared", "fear"] },
            { char: "😰", tags: ["anxious", "sweat"] },
            { char: "😥", tags: ["sad relief", "whew"] },
            { char: "😢", tags: ["cry", "tear", "sad"] },
            { char: "😭", tags: ["sob", "crying loudly"] },
            { char: "😱", tags: ["scream", "shock", "horror"] },
            { char: "😖", tags: ["frustrated", "stressed"] },
            { char: "😣", tags: ["struggling", "pain"] },
            { char: "😞", tags: ["disappointed", "sad"] },
            { char: "😓", tags: ["sweat", "hard work"] },
            { char: "😩", tags: ["weary", "tired"] },
            { char: "😫", tags: ["tired", "exhausted"] },
            { char: "🥱", tags: ["yawn", "sleepy"] },
            { char: "😤", tags: ["triumph", "proud", "huff"] },
            { char: "😡", tags: ["pouting", "rage", "mad"] },
            { char: "😠", tags: ["angry", "mad"] },
            { char: "🤬", tags: ["cursing", "swear"] },
            { char: "😈", tags: ["devil", "evil smile"] },
            { char: "👿", tags: ["angry devil", "demon"] },
            { char: "💀", tags: ["skull", "dead", "dead laughing"] },
            { char: "☠️", tags: ["crossbones", "danger"] },
            { char: "💩", tags: ["poop", "poo"] },
            { char: "🤡", tags: ["clown", "circus"] },
            { char: "👻", tags: ["ghost", "spooky", "boo"] },
            { char: "👽", tags: ["alien", "ufo", "space"] },
            { char: "🤖", tags: ["robot", "bot", "ai"] },
        ],
    },
    {
        id: "gestures",
        name: "Hands & People",
        icon: MdPets,
        emojis: [
            { char: "👋", tags: ["wave", "hello", "bye"] },
            { char: "🤚", tags: ["back of hand", "stop"] },
            { char: "🖐", tags: ["raised hand", "five"] },
            { char: "✋", tags: ["hand", "high five"] },
            { char: "🖖", tags: ["vulcan", "spock"] },
            { char: "👌", tags: ["ok", "perfect", "fine"] },
            { char: "🤌", tags: ["pinched fingers", "italian"] },
            { char: "🤏", tags: ["pinching", "small amount"] },
            { char: "✌️", tags: ["peace", "victory", "two"] },
            { char: "🤞", tags: ["fingers crossed", "luck"] },
            { char: "🫰", tags: ["hand with index and thumb", "kpop"] },
            { char: "🤟", tags: ["love you", "rock"] },
            { char: "🤘", tags: ["rock on", "horns"] },
            { char: "🤙", tags: ["call me", "shaka"] },
            { char: "👈", tags: ["point left"] },
            { char: "👉", tags: ["point right"] },
            { char: "👆", tags: ["point up"] },
            { char: "🖕", tags: ["middle finger"] },
            { char: "👇", tags: ["point down"] },
            { char: "☝️", tags: ["index pointing up"] },
            { char: "👍", tags: ["thumbs up", "like", "approve"] },
            { char: "👎", tags: ["thumbs down", "dislike"] },
            { char: "✊", tags: ["fist", "power"] },
            { char: "👊", tags: ["fist bump", "punch"] },
            { char: "🤛", tags: ["left fist"] },
            { char: "🤜", tags: ["right fist"] },
            { char: "👏", tags: ["clap", "applause", "bravo"] },
            { char: "🙌", tags: ["hands up", "celebration"] },
            { char: "👐", tags: ["open hands"] },
            { char: "🤲", tags: ["palms up", "pray"] },
            { char: "🤝", tags: ["handshake", "deal", "agree"] },
            { char: "🙏", tags: ["folded hands", "pray", "thanks"] },
            { char: "✍️", tags: ["writing", "pencil"] },
            { char: "💅", tags: ["nail polish", "slay"] },
            { char: "🤳", tags: ["selfie", "camera"] },
            { char: "💪", tags: ["muscle", "flex", "strong"] },
            { char: "👀", tags: ["eyes", "look", "see"] },
            { char: "👁", tags: ["eye", "watch"] },
            { char: "🧠", tags: ["brain", "smart"] },
            { char: "🫀", tags: ["heart", "organ"] },
            { char: "🫁", tags: ["lungs", "breathe"] },
            { char: "🦷", tags: ["tooth", "dentist"] },
            { char: "🦴", tags: ["bone"] },
        ],
    },
    {
        id: "animals",
        name: "Animals & Nature",
        icon: MdPets,
        emojis: [
            { char: "🐶", tags: ["dog", "puppy", "pet"] },
            { char: "🐱", tags: ["cat", "kitten", "kitty"] },
            { char: "🐭", tags: ["mouse", "rat"] },
            { char: "🐹", tags: ["hamster", "rodent"] },
            { char: "🐰", tags: ["rabbit", "bunny"] },
            { char: "🦊", tags: ["fox", "clever"] },
            { char: "🐻", tags: ["bear", "grizzly"] },
            { char: "🐼", tags: ["panda", "bear"] },
            { char: "🐨", tags: ["koala", "australia"] },
            { char: "🐯", tags: ["tiger", "cat"] },
            { char: "🦁", tags: ["lion", "king"] },
            { char: "🐮", tags: ["cow", "moo"] },
            { char: "🐷", tags: ["pig", "oink"] },
            { char: "🐸", tags: ["frog", "toad"] },
            { char: "🐵", tags: ["monkey", "ape"] },
            { char: "🐔", tags: ["chicken", "rooster"] },
            { char: "🐧", tags: ["penguin", "bird"] },
            { char: "🐦", tags: ["bird", "tweet"] },
            { char: "🐤", tags: ["baby chick"] },
            { char: "🦆", tags: ["duck", "quack"] },
            { char: "🦅", tags: ["eagle", "bird"] },
            { char: "🦉", tags: ["owl", "night", "wise"] },
            { char: "🐺", tags: ["wolf", "howl"] },
            { char: "🦄", tags: ["unicorn", "magic"] },
            { char: "🐝", tags: ["bee", "honey"] },
            { char: "🐛", tags: ["bug", "caterpillar"] },
            { char: "🦋", tags: ["butterfly", "pretty"] },
            { char: "🐌", tags: ["snail", "slow"] },
            { char: "🐞", tags: ["ladybug", "lucky"] },
            { char: "🐢", tags: ["turtle", "slow"] },
            { char: "🐍", tags: ["snake", "reptile"] },
            { char: "🐙", tags: ["octopus", "sea"] },
            { char: "🐬", tags: ["dolphin", "ocean"] },
            { char: "🐳", tags: ["whale", "spouting"] },
            { char: "🦈", tags: ["shark", "ocean"] },
            { char: "🌴", tags: ["palm tree", "tropical", "beach"] },
            { char: "🌲", tags: ["evergreen tree", "nature"] },
            { char: "🌱", tags: ["seedling", "grow", "plant"] },
            { char: "🌿", tags: ["herb", "green", "leaf"] },
            { char: "🍀", tags: ["four leaf clover", "lucky"] },
            { char: "🌸", tags: ["cherry blossom", "flower", "spring"] },
            { char: "🌹", tags: ["rose", "romantic", "flower"] },
            { char: "🌻", tags: ["sunflower", "summer"] },
            { char: "🔥", tags: ["fire", "flame", "lit", "hot"] },
            { char: "✨", tags: ["sparkles", "stars", "shine"] },
            { char: "⚡️", tags: ["lightning", "thunder", "power"] },
            { char: "🌈", tags: ["rainbow", "pride", "colors"] },
            { char: "☀️", tags: ["sun", "sunny", "bright"] },
            { char: "🌙", tags: ["crescent moon", "night"] },
            { char: "❄️", tags: ["snowflake", "winter", "cold"] },
        ],
    },
    {
        id: "food",
        name: "Food & Drink",
        icon: MdRestaurant,
        emojis: [
            { char: "🍏", tags: ["green apple", "fruit"] },
            { char: "🍎", tags: ["red apple", "fruit"] },
            { char: "🍐", tags: ["pear", "fruit"] },
            { char: "🍊", tags: ["tangerine", "orange"] },
            { char: "🍋", tags: ["lemon", "citrus"] },
            { char: "🍌", tags: ["banana", "fruit"] },
            { char: "🍉", tags: ["watermelon", "summer"] },
            { char: "🍇", tags: ["grapes", "fruit"] },
            { char: "🍓", tags: ["strawberry", "berry"] },
            { char: "🍒", tags: ["cherries", "fruit"] },
            { char: "🍑", tags: ["peach", "fruit"] },
            { char: "🥭", tags: ["mango", "tropical"] },
            { char: "🍍", tags: ["pineapple", "fruit"] },
            { char: "🥑", tags: ["avocado", "guacamole"] },
            { char: "🍔", tags: ["hamburger", "burger", "fast food"] },
            { char: "🍟", tags: ["french fries", "chips"] },
            { char: "🍕", tags: ["pizza", "slice", "cheese"] },
            { char: "🌭", tags: ["hot dog", "frankfurter"] },
            { char: "🥪", tags: ["sandwich", "lunch"] },
            { char: "🌮", tags: ["taco", "mexican"] },
            { char: "🌯", tags: ["burrito", "wrap"] },
            { char: "🥗", tags: ["salad", "healthy", "green"] },
            { char: "🍿", tags: ["popcorn", "movie"] },
            { char: "🍣", tags: ["sushi", "japanese"] },
            { char: "🍜", tags: ["ramen", "noodles", "soup"] },
            { char: "🍝", tags: ["spaghetti", "pasta", "italian"] },
            { char: "🍩", tags: ["doughnut", "donut", "sweet"] },
            { char: "🍪", tags: ["cookie", "biscuit", "chocolate"] },
            { char: "🎂", tags: ["birthday cake", "celebration"] },
            { char: "🍰", tags: ["shortcake", "cake"] },
            { char: "🧁", tags: ["cupcake", "sweet"] },
            { char: "🍫", tags: ["chocolate bar", "candy"] },
            { char: "🍬", tags: ["candy", "sweet"] },
            { char: "🍭", tags: ["lollipop", "sweet"] },
            { char: "🍦", tags: ["ice cream", "soft serve"] },
            { char: "☕️", tags: ["coffee", "hot beverage", "tea"] },
            { char: "🍵", tags: ["green tea", "matcha"] },
            { char: "🧃", tags: ["juice box", "drink"] },
            { char: "🧋", tags: ["boba", "bubble tea"] },
            { char: "🍺", tags: ["beer", "drink", "pub"] },
            { char: "🍻", tags: ["cheers", "clinking beers"] },
            { char: "🥂", tags: ["champagne", "toast"] },
            { char: "🍷", tags: ["wine", "glass"] },
            { char: "🍸", tags: ["cocktail", "martini"] },
        ],
    },
    {
        id: "activities",
        name: "Activities & Sports",
        icon: MdSportsSoccer,
        emojis: [
            { char: "⚽️", tags: ["soccer", "football", "ball"] },
            { char: "🏀", tags: ["basketball", "hoop", "ball"] },
            { char: "🏈", tags: ["american football", "nfl"] },
            { char: "⚾️", tags: ["baseball", "ball"] },
            { char: "🎾", tags: ["tennis", "racket"] },
            { char: "🏐", tags: ["volleyball", "beach"] },
            { char: "🏉", tags: ["rugby", "ball"] },
            { char: "🥏", tags: ["frisbee", "disc"] },
            { char: "🎱", tags: ["8 ball", "pool", "billiards"] },
            { char: "🏓", tags: ["ping pong", "table tennis"] },
            { char: "🏸", tags: ["badminton", "shuttlecock"] },
            { char: "🥊", tags: ["boxing glove", "fight"] },
            { char: "🥋", tags: ["martial arts", "karate"] },
            { char: "⛳️", tags: ["golf", "hole"] },
            { char: "🎯", tags: ["target", "bullseye", "dart"] },
            { char: "🎮", tags: ["video game", "controller", "gaming"] },
            { char: "🎲", tags: ["game die", "dice", "luck"] },
            { char: "🧩", tags: ["puzzle piece", "game"] },
            { char: "🏆", tags: ["trophy", "winner", "first place"] },
            { char: "🥇", tags: ["1st place medal", "gold"] },
            { char: "🥈", tags: ["2nd place medal", "silver"] },
            { char: "🥉", tags: ["3rd place medal", "bronze"] },
            { char: "🎨", tags: ["artist palette", "paint", "art"] },
            { char: "🎬", tags: ["clapper board", "movie", "film"] },
            { char: "🎤", tags: ["microphone", "sing", "karaoke"] },
            { char: "🎧", tags: ["headphones", "music", "listen"] },
            { char: "🎸", tags: ["guitar", "rock", "music"] },
            { char: "🎹", tags: ["musical keyboard", "piano"] },
        ],
    },
    {
        id: "travel",
        name: "Travel & Places",
        icon: MdFlight,
        emojis: [
            { char: "🚗", tags: ["car", "automobile", "drive"] },
            { char: "🚕", tags: ["taxi", "cab"] },
            { char: "🏎", tags: ["racing car", "f1", "speed"] },
            { char: "🚑", tags: ["ambulance", "hospital"] },
            { char: "🚒", tags: ["fire engine", "truck"] },
            { char: "🚓", tags: ["police car", "cop"] },
            { char: "🚲", tags: ["bicycle", "bike"] },
            { char: "🛵", tags: ["motor scooter", "vespa"] },
            { char: "🏍", tags: ["motorcycle", "bike"] },
            { char: "🚀", tags: ["rocket", "space", "launch", "fast"] },
            { char: "🛸", tags: ["flying saucer", "ufo", "alien"] },
            { char: "✈️", tags: ["airplane", "flight", "travel"] },
            { char: "🛫", tags: ["airplane departure", "takeoff"] },
            { char: "🛬", tags: ["airplane arrival", "landing"] },
            { char: "🚁", tags: ["helicopter", "fly"] },
            { char: "⛵️", tags: ["sailboat", "boat", "sea"] },
            { char: "🛥", tags: ["motor boat", "yacht"] },
            { char: "🛳", tags: ["passenger ship", "cruise"] },
            { char: "⚓️", tags: ["anchor", "ship", "sea"] },
            { char: "🗼", tags: ["tokyo tower", "monument"] },
            { char: "🗽", tags: ["statue of liberty", "new york"] },
            { char: "🏰", tags: ["castle", "fairytale"] },
            { char: "🏖", tags: ["beach with umbrella", "vacation"] },
            { char: "🏝", tags: ["desert island", "tropical"] },
            { char: "🌋", tags: ["volcano", "lava", "eruption"] },
            { char: "🏕", tags: ["camping", "tent", "nature"] },
        ],
    },
    {
        id: "objects",
        name: "Objects & Tech",
        icon: MdLightbulb,
        emojis: [
            { char: "📱", tags: ["mobile phone", "smartphone", "iphone"] },
            { char: "💻", tags: ["laptop", "computer", "macbook"] },
            { char: "⌨️", tags: ["keyboard", "type"] },
            { char: "🖥", tags: ["desktop computer", "screen"] },
            { char: "📷", tags: ["camera", "photo"] },
            { char: "📸", tags: ["camera with flash", "snapshot"] },
            { char: "💡", tags: ["light bulb", "idea", "smart"] },
            { char: "🔦", tags: ["flashlight", "torch"] },
            { char: "⏰", tags: ["alarm clock", "wake up", "time"] },
            { char: "💰", tags: ["money bag", "rich", "cash"] },
            { char: "💎", tags: ["gem stone", "diamond", "jewel"] },
            { char: "🔑", tags: ["key", "password", "lock"] },
            { char: "🔒", tags: ["locked", "security", "safe"] },
            { char: "🔓", tags: ["unlocked", "open"] },
            { char: "📦", tags: ["package", "delivery", "box"] },
            { char: "🎁", tags: ["wrapped gift", "present", "birthday"] },
            { char: "🎉", tags: ["party popper", "tada", "celebrate"] },
            { char: "🎊", tags: ["confetti ball", "party"] },
            { char: "🎈", tags: ["balloon", "birthday"] },
            { char: "✉️", tags: ["envelope", "email", "letter"] },
            { char: "📝", tags: ["memo", "note", "pencil"] },
            { char: "📌", tags: ["pushpin", "pin"] },
            { char: "📍", tags: ["round pushpin", "location", "map"] },
            { char: "🔍", tags: ["magnifying glass", "search", "find"] },
        ],
    },
    {
        id: "symbols",
        name: "Symbols & Hearts",
        icon: MdFavorite,
        emojis: [
            { char: "❤️", tags: ["red heart", "love"] },
            { char: "🧡", tags: ["orange heart", "love"] },
            { char: "💛", tags: ["yellow heart", "love"] },
            { char: "💚", tags: ["green heart", "love"] },
            { char: "💙", tags: ["blue heart", "love"] },
            { char: "💜", tags: ["purple heart", "love"] },
            { char: "🖤", tags: ["black heart", "dark"] },
            { char: "🤍", tags: ["white heart", "pure"] },
            { char: "🤎", tags: ["brown heart"] },
            { char: "💔", tags: ["broken heart", "heartbreak"] },
            { char: "❣️", tags: ["heart exclamation"] },
            { char: "💕", tags: ["two hearts", "love"] },
            { char: "💞", tags: ["revolving hearts"] },
            { char: "💓", tags: ["beating heart"] },
            { char: "💗", tags: ["growing heart"] },
            { char: "💖", tags: ["sparkling heart"] },
            { char: "💘", tags: ["heart with arrow", "cupid"] },
            { char: "💝", tags: ["heart with ribbon", "gift"] },
            { char: "💯", tags: ["hundred points", "score", "perfect"] },
            { char: "💢", tags: ["anger symbol", "mad"] },
            { char: "💬", tags: ["speech balloon", "chat", "message"] },
            { char: "💭", tags: ["thought balloon", "think"] },
            { char: "💤", tags: ["zzz", "sleep"] },
            { char: "⚠️", tags: ["warning", "caution", "alert"] },
            { char: "✅", tags: ["check mark", "done", "yes"] },
            { char: "❌", tags: ["cross mark", "no", "x"] },
            { char: "❓", tags: ["question mark", "help"] },
            { char: "❗️", tags: ["exclamation mark", "important"] },
            { char: "🎵", tags: ["musical note", "song"] },
            { char: "🎶", tags: ["musical notes", "music"] },
        ],
    },
];

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState("smileys");
    const [searchQuery, setSearchQuery] = useState("");
    const [recentEmojis, setRecentEmojis] = useState([]);
    const pickerRef = useRef(null);

    // Load recent emojis from localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("recent_emojis") || "[]");
            setRecentEmojis(saved);
        } catch {
            setRecentEmojis([]);
        }
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                onClose?.();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Handle emoji click & update recent emojis
    const handleEmojiClick = (emojiChar) => {
        onSelectEmoji(emojiChar);
        try {
            const nextRecent = [
                emojiChar,
                ...recentEmojis.filter((e) => e !== emojiChar),
            ].slice(0, 16);
            setRecentEmojis(nextRecent);
            localStorage.setItem("recent_emojis", JSON.stringify(nextRecent));
        } catch {
            // ignore
        }
    };

    // Filter emojis based on search query
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const q = searchQuery.toLowerCase().trim();
        const results = [];
        const seen = new Set();

        for (const cat of EMOJI_CATEGORIES) {
            for (const item of cat.emojis) {
                if (!seen.has(item.char)) {
                    const matchChar = item.char === q;
                    const matchTag = item.tags.some((tag) => tag.includes(q));
                    if (matchChar || matchTag) {
                        results.push(item);
                        seen.add(item.char);
                    }
                }
            }
        }
        return results;
    }, [searchQuery]);

    const activeCategoryObj = useMemo(() => {
        return EMOJI_CATEGORIES.find((c) => c.id === selectedCategory);
    }, [selectedCategory]);

    return (
        <div
            ref={pickerRef}
            className="w-80 md:w-96 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-zinc-100 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
            {/* Top Search Header */}
            <div className="p-2.5 border-b border-zinc-800/80 flex items-center gap-2">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-base" />
                    <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search all emojis (e.g. fire, happy, heart)..."
                        className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                            <MdClose className="text-xs" />
                        </button>
                    )}
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                        <MdClose className="text-base" />
                    </button>
                )}
            </div>

            {/* Category Navigation Bar (hidden during search) */}
            {!searchQuery && (
                <div className="flex items-center px-2 py-1.5 border-b border-zinc-800/60 bg-zinc-950/40 gap-1 overflow-x-auto scrollbar-none">
                    {EMOJI_CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                title={cat.name}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    isActive
                                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                                }`}
                            >
                                <IconComponent className="text-base" />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Emoji Grid Area */}
            <div className="p-3 max-h-64 overflow-y-auto space-y-3">
                {/* Search Results Mode */}
                {searchQuery ? (
                    <div>
                        <p className="text-[11px] font-medium text-zinc-400 mb-2">
                            Search Results ({searchResults?.length || 0})
                        </p>
                        {searchResults && searchResults.length > 0 ? (
                            <div className="grid grid-cols-8 gap-1">
                                {searchResults.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        title={item.tags.join(", ")}
                                        onClick={() => handleEmojiClick(item.char)}
                                        className="h-9 w-9 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg transition-transform active:scale-125 cursor-pointer"
                                    >
                                        {item.char}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 text-center py-6">
                                No emojis matching "{searchQuery}"
                            </p>
                        )}
                    </div>
                ) : (
                    /* Categorized Mode */
                    <>
                        {/* Recently Used Row (if any) */}
                        {recentEmojis.length > 0 && selectedCategory === "smileys" && (
                            <div className="mb-2">
                                <p className="text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                                    <MdHistory className="text-xs text-zinc-500" />
                                    <span>Frequently Used</span>
                                </p>
                                <div className="grid grid-cols-8 gap-1">
                                    {recentEmojis.map((emoji, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="h-9 w-9 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg transition-transform active:scale-125 cursor-pointer"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-b border-zinc-800/80 my-2" />
                            </div>
                        )}

                        {/* Active Category Header & Grid */}
                        {activeCategoryObj && (
                            <div>
                                <p className="text-[11px] font-medium text-zinc-400 mb-1.5">
                                    {activeCategoryObj.name}
                                </p>
                                <div className="grid grid-cols-8 gap-1">
                                    {activeCategoryObj.emojis.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            title={item.tags.join(", ")}
                                            onClick={() => handleEmojiClick(item.char)}
                                            className="h-9 w-9 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg transition-transform active:scale-125 cursor-pointer"
                                        >
                                            {item.char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Mini Footer */}
            <div className="px-3 py-1.5 bg-zinc-950/60 border-t border-zinc-800/80 text-[10px] text-zinc-500 flex justify-between items-center">
                <span>Click emoji to insert</span>
                <span className="text-zinc-600 font-mono">Unicode 15.0</span>
            </div>
        </div>
    );
};

export default EmojiPicker;

