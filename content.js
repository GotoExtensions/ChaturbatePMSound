if (typeof browser === "undefined") {
	var browser = chrome;
}

var soundEnabled;
var muteNameList = [];
const soundFile = browser.runtime.getURL("resource/pop-alert.mp3");
const pmSound = new Audio(soundFile);

function checkSetting(storage) {
	console.log(storage);
	if (storage.on === undefined) {
		browser.storage.local.set({ on: true });
		soundEnabled = true;
	} else {
		soundEnabled = storage.on;
	}

	muteNameList = storage.muteList || [];
	pmSound.volume = storage.volume || 0.5;
	volumeSlider.value = storage.volume || 0.5;

	if (storage.sound) {
		if (storage.sound === "custom" && storage.customSound) {
			pmSound.src = storage.customSound;
			soundSelector.value = "custom";
			updateCustomSoundUI(storage.customSoundName);
		} else {
			pmSound.src = browser.runtime.getURL(`resource/${storage.sound}.mp3`);
			soundSelector.value = storage.sound;
		}
	} else {
		pmSound.src = browser.runtime.getURL(`resource/pop-alert.mp3`);
		soundSelector.value = "pop-alert";
	}

	// This now updates the state of ALL speaker icons on load
	setSoundButtonState(soundEnabled);
}

//    OBSERVER TARGET

const targetNode = document.querySelector(".BaseTabsContainer .conversationBodyRoot");

const observer = new MutationObserver(function (mutations) {
	for (const mutation of mutations) {
		if (mutation.addedNodes[0] && mutation.addedNodes[0].classList.contains("conversationListItem")) {
			let usrName = mutation.addedNodes[0].children[1].firstChild.textContent;
			AddButtons(usrName, mutation.addedNodes[0]);
			if (mutations.length <= 3 && mutation.addedNodes[0].classList.contains("unreadBg") && !muteNameList.includes(usrName)) playNotificationSound();
		}
		console.log(mutation);
	}
});

function AddButtons(usrName, parent) {
	parent.insertAdjacentHTML(
		"beforeend",
		`<div id="pmExtButton_${usrName}"  class="userSpeakerContainer">
		${svgHTML}
		</div>
		`
	);
	let userSpeakerButton = document.getElementById("pmExtButton_" + usrName);
	userSpeakerButton.addEventListener("click", function (event) {
		event.stopPropagation();
		userSpeakerClick(usrName);
	});
	if (muteNameList.includes(usrName)) userSpeakerButton.children[0].style.display = "none";
	else userSpeakerButton.children[1].style.display = "none";
}

function userSpeakerClick(user) {
	let button = document.getElementById("pmExtButton_" + user);
	if (muteNameList.includes(user)) {
		button.children[0].style.display = "block";
		button.children[1].style.display = "none";
		muteNameList.splice(muteNameList.indexOf(user), 1);
	} else {
		button.children[0].style.display = "none";
		button.children[1].style.display = "block";
		muteNameList.push(user);
	}
	browser.storage.local.set({ muteList: muteNameList });
}

//		GET AUDIO

function playNotificationSound() {
	if (soundEnabled) {
		pmSound.play();
	}
}

//    DEFINE BUTTON

const tabRow = document.querySelector("#ChatTabContainer #tab-row");

const svgHTML = `<svg class="pmExtensionSpeaker on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="2 3 70 70">
<path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" style="stroke:#CCC;stroke-width:5;stroke-linejoin:round;fill:#CCC;"/>
<path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#CCC;stroke-width:5;stroke-linecap:round"/>
</svg>
<svg class="pmExtensionSpeaker off" xmlns="http://www.w3.org/2000/svg" version="1.0" width="18" height="18" viewBox="2 3 70 70" stroke="#CCC" stroke-width="5">
<path d="m39,14-17,15H6V48H22l17,15z" fill="#A22" stroke-linejoin="round"/>
<path d="m49,26 20,24m0-24-20,24" fill="none" stroke-linecap="round"/>
</svg>`;

const gearHTML = `<svg fill="#BBB" class="pmExtensionOptions" width="18px" height="18px" viewBox="0 0 512 512" id="_x30_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <path d="M496.851,212.213l-48.806-12.201c-4.106-14.108-9.722-27.572-16.666-40.205l25.89-43.151  c4.722-7.869,3.482-17.943-3.008-24.432l-34.485-34.485c-6.489-6.49-16.563-7.729-24.432-3.008l-43.151,25.89  c-12.633-6.944-26.097-12.56-40.205-16.666l-12.201-48.805C297.561,6.246,289.562,0,280.384,0h-48.769  c-9.177,0-17.177,6.246-19.403,15.149l-12.201,48.805c-14.108,4.106-27.572,9.722-40.205,16.666l-43.151-25.89  c-7.87-4.722-17.943-3.482-24.432,3.008L57.738,92.223c-6.489,6.489-7.729,16.562-3.008,24.432l25.89,43.151  c-6.944,12.633-12.56,26.097-16.666,40.205l-48.806,12.201C6.246,214.438,0,222.438,0,231.615v48.769  c0,9.177,6.246,17.177,15.149,19.403l48.806,12.201c4.106,14.108,9.722,27.572,16.666,40.205l-25.89,43.151  c-4.722,7.869-3.482,17.943,3.008,24.432l34.485,34.485c6.489,6.49,16.563,7.729,24.432,3.008l43.151-25.89  c12.633,6.944,26.097,12.56,40.205,16.666l12.201,48.805c2.226,8.903,10.225,15.149,19.403,15.149h48.769  c9.177,0,17.177-6.246,19.403-15.149l12.201-48.805c14.108-4.106,27.572-9.722,40.205-16.666l43.151,25.89  c7.87,4.722,17.943,3.482,24.432-3.008l34.485-34.485c6.489-6.489,7.729-16.562,3.008-24.432l-25.89-43.151  c6.944-12.633,12.56-26.097,16.666-40.205l48.806-12.201c8.903-2.226,15.149-10.226,15.149-19.403v-48.769  C512,222.438,505.754,214.438,496.851,212.213z M256,336c-44.112,0-80-35.888-80-80s35.888-80,80-80s80,35.888,80,80  S300.112,336,256,336z"/></svg>`;

let svgID = "extensionSpeaker";

tabRow.insertAdjacentHTML(
	"beforeend",
	`
	<div id="pmSoundOptionsContainer">
		<div class="pmSoundButton taskSoundButton">${svgHTML}</div>
		<div id="pmOptionsButton" >${gearHTML}</div>
	</div>
	`
);

tabRow.insertAdjacentHTML(
	"beforebegin",
	`
	<div id="pmSoundOptionBox">
		<div class="option-row" id="sliderContainerBox">
			<div class="pmSoundButton" >${svgHTML}</div>
			<input type="range" id="PmExtVolumeSlider" min="0" max="1" step="0.01" value="0.5" />
		</div>

		<div class="option-row">
			<div class="selection-group">
				<label for="soundSelector">Select Sound</label>
				<select id="soundSelector">
					<option value="pop-alert" selected>Pop</option>
					<option value="drop">Drop</option>
					<option value="slide2">Wood slide</option>
					<option value="bling">Bling</option>
					<option id="pmCustomSelect" value="custom" disabled>Custom</option>
				</select>
			</div>
		</div>

		<div class="option-row">
            <button id="customSoundButton">
                <span class="button-text">Custom Sound File</span>
                <svg class="delete-icon"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" fill="#0F0F0F"/>
                </svg>
            </button>
			<input type="file" id="customSoundInput" accept=".mp3, .wav, .ogg" style="display: none;" />
		</div>
	</div>
	`
);

//    ATTACH CSS

const style = document.createElement("style");
style.innerHTML = `
#pmSoundOptionBox {
	display: none;
	flex-direction: column;
	justify-content: space-between;
	width: 180px;
	height: 180px;
	background: #4a5257;
	border: 1px solid #8C9C99;
	border-radius: 5px;
	position: absolute;
	z-index: 10;
	right: 3px;
	top: 2.5em;
	padding: 10px;
	box-sizing: border-box;
}
body.darkmode #pmSoundOptionBox {
	background: #17202A;
}
/* Layout Helpers */
.option-row {
	display: flex;
	align-items: center;
	min-width: 0;
}

.selection-group {
	margin-top: -0.5em;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.selection-group label {
	color: #CCC;
	margin-bottom: 5px;
}

/* General UI in Top Bar */
#pmSoundOptionsContainer {
	display: inline-block;
	float: right;
}

#pmOptionsButton, .pmSoundButton {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	position: relative;
	top: -1px;
	width: 20px;
	height: 19px;
	padding: 1px;
	border: none;
	background: transparent;
	cursor: pointer;
	border-radius: 2px;
	transition: background-color 0.2s ease;
}


#pmOptionsButton:hover, .pmSoundButton:hover, .userSpeakerContainer:hover {
    background-color: rgba(0, 0, 0, 0.25);
}

/* Dark Mode Override */
body.darkmode #pmOptionsButton:hover,
body.darkmode .pmSoundButton:hover,
body.darkmode .userSpeakerContainer:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.pmSoundButton {
	margin-right: 0.2em;
}

#pmOptionsButton {
	margin-right: 0.3em;
}

/* Per-User Mute Button in Chat List */
.userSpeakerContainer {
	position: absolute;
	right: 6%;
	top: 50%;
    transform: translateY(-50%); /* Better vertical centering regardless of parent height */

	/* New styles for sizing and centering */
	width: 32px;
	height: 32px;
	display: flex;
	justify-content: center;
	align-items: center;

	/* New styles for hover effect */
	border-radius: 7%;
	transition: background-color 0.2s ease;
    cursor: pointer;
}

.pmExtensionSpeaker {
	position: relative;
	top: 1px;
	left: -1px
}

.pmExtensionOptions{
	position:relative;
}

/* Volume Slider */
#PmExtVolumeSlider {
	flex-grow: 1;
	margin-left: 10px;
	min-width: 0;
	height: 5px;
	background: #888;
	border-radius: 5px;
	outline: none;
	cursor: pointer;
	-webkit-appearance: none;
	appearance: none;
}

#PmExtVolumeSlider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 15px;
	height: 15px;
	background: #477dcc;
	border-radius: 50%;
	cursor: pointer;
}

#PmExtVolumeSlider::-moz-range-thumb {
	width: 15px;
	height: 15px;
	background: #477dcc;
	border-radius: 50%;
	cursor: pointer;
}

/* Sound Dropdown */
#soundSelector {
	/* No special styling needed */
}

/* Custom Sound Button (All States) */
#customSoundButton {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-grow: 1;
	min-width: 0;
	padding: 8px 10px;
	border: none;
	border-radius: 3px;
	cursor: pointer;
	transition: background-color 0.2s ease;
	overflow: hidden;
	background-color: #477dcc;
	color: white;
}

#customSoundButton:hover {
	background-color: #5a9bff;
}

.button-text {
	white-space: nowrap;
	overflow: hidden;
	text-align: center;
}

.delete-icon {
	display: none;
	position: absolute;
	top: 50%;
	right: 10px;
	transform: translateY(-50%);
	width: 18px;
	height: 18px;
	fill: white;
	cursor: pointer;
	flex-shrink: 0;
}

#customSoundButton.has-custom-sound {
	background-color: #2ECC71;
}

#customSoundButton.has-custom-sound .button-text {
	mask-image: linear-gradient(to right, #000 75%, transparent 86%);
	-webkit-mask-image: linear-gradient(to right, #000 75%, transparent 86%);
}

#customSoundButton.has-custom-sound .delete-icon {
	display: block;
}

#customSoundButton.has-custom-sound:hover {
	background-color: #E74C3C;
}`;

document.head.appendChild(style);

//    BUTTON TOGGLE

const soundButtons = document.querySelectorAll(".pmSoundButton");

const volumeSlider = document.getElementById("PmExtVolumeSlider");
const soundSelector = document.getElementById("soundSelector");
const customSoundButton = document.getElementById("customSoundButton");
const customSoundInput = document.getElementById("customSoundInput");

const options = document.getElementById("pmSoundOptionBox");
let optionsOpen = false;

document.getElementById("pmOptionsButton").addEventListener("click", () => {
	optionsOpen = !optionsOpen;
	options.style.display = optionsOpen ? "flex" : "none";
});

function setSoundButtonState(enabled) {
	soundButtons.forEach((button) => {
		const speakerOn = button.querySelector(".on");
		const speakerMute = button.querySelector(".off");
		speakerOn.style.display = enabled ? "inline-block" : "none";
		speakerMute.style.display = enabled ? "none" : "inline-block";
	});
}

soundButtons.forEach((button) => {
	button.addEventListener("click", () => {
		soundEnabled = !soundEnabled; // Toggle the state
		setSoundButtonState(soundEnabled); // Update all buttons
		browser.storage.local.set({ on: soundEnabled }); // Save the new state
	});
});

volumeSlider.addEventListener("input", function () {
	pmSound.volume = this.value;
	browser.storage.local.set({ volume: this.value });
});

soundSelector.addEventListener("change", (event) => {
	const selectedSound = event.target.value;
	browser.storage.local.set({ sound: selectedSound });

	if (selectedSound === "custom") {
		browser.storage.local.get("customSound", (data) => {
			if (data.customSound) {
				pmSound.src = data.customSound;
				pmSound.play().catch(() => {});
			}
		});
	} else {
		pmSound.src = browser.runtime.getURL(`resource/${selectedSound}.mp3`);
		pmSound.play().catch(() => {});
	}
});

const buttonText = customSoundButton.querySelector(".button-text");
const deleteIcon = customSoundButton.querySelector(".delete-icon");
const customOption = soundSelector.querySelector("#pmCustomSelect");

function updateCustomSoundUI(soundName = null) {
	console.log("CUSTOM OPTION:" + customOption);
	if (soundName) {
		buttonText.textContent = soundName;
		customSoundButton.classList.add("has-custom-sound");
		if (customOption) customOption.disabled = false;
	} else {
		buttonText.textContent = "Custom Sound File";
		customSoundButton.classList.remove("has-custom-sound");
		if (customOption) customOption.disabled = true;
	}
}

function deleteCustomSound(event) {
	event.stopPropagation(); // Prevent the file picker from opening
	const keysToRemove = ["customSound", "customSoundName"];
	browser.storage.local.remove(keysToRemove);
	browser.storage.local.set({ sound: "pop-alert" });

	// Revert UI to default state
	updateCustomSoundUI(null);
	soundSelector.value = "pop-alert"; // Switch to default sound
	pmSound.src = browser.runtime.getURL("resource/pop-alert.mp3");
}

customSoundButton.addEventListener("click", () => {
	// Only trigger file input if we're not in delete mode
	if (!customSoundButton.classList.contains("has-custom-sound")) {
		customSoundInput.click();
	}
});
deleteIcon.addEventListener("click", deleteCustomSound);

customSoundInput.addEventListener("change", () => {
	const file = customSoundInput.files[0];
	if (file) {
		const maxSize = 524288; // 512 KB limit
		const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];

		if (!validTypes.includes(file.type) || file.size > maxSize) {
			alert("Invalid file. Please select an MP3, WAV, or OGG file under 512 KB.");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const soundData = {
				customSound: reader.result,
				customSoundName: file.name,
				sound: "custom", // Also save the current sound preference
			};

			browser.storage.local.set(soundData).then(() => {
				pmSound.src = soundData.customSound;
				updateCustomSoundUI(soundData.customSoundName);

				// Enable and select "Custom" in the dropdown
				soundSelector.value = "custom";
			});
		};
		reader.readAsDataURL(file);
	}
});

//    initialize
browser.storage.local.get(null, checkSetting);
observer.observe(targetNode, { childList: true });
