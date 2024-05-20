let CurrentSong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let Response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = Response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".SongList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img src="SVG/music.svg" class="invert" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", "")}</div>
        </div>
        <div class="palynow">
            <span>Play Now</span>
            <img src="SVG/paly.svg" class="invert" alt="">
        </div>
    </li>`;
  }

  Array.from(
    document.querySelector(".SongList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, push = false) => {
  CurrentSong.src = `/${currfolder}/` + track;
  if (!push) {
    CurrentSong.play();
    play.src = "SVG/push.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let Response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = Response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`/songs/${folder}/info.json`);
      let Response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
            <div class="play">
                <button>
                    <img src="SVG/green.svg" alt="">
                </button>
            </div>
            <img src="/songs/${folder}/No.jpg" alt="">
            <h2> ${Response.title}</h2>
            <p>
               ${Response.Description}
            </p>
        </div>`;
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}
async function main() {
  await getSongs("songs/Animal");
  playMusic(songs[0], true);
  displayAlbums();

  play.addEventListener("click", () => {
    if (CurrentSong.paused) {
      CurrentSong.play();
      play.src = "SVG/push.svg";
    } else {
      CurrentSong.pause();
      play.src = "SVG/paly.svg";
    }
  });

  CurrentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(
          CurrentSong.currentTime
        )}/${secondsToMinutesSeconds(CurrentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let parcent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = parcent + "%";
    CurrentSong.currentTime = (CurrentSong.duration * parcent) / 100;
  });

  document.querySelector(".hambar").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".hidden").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    CurrentSong.pause();
    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    CurrentSong.pause();

    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
}

main();
