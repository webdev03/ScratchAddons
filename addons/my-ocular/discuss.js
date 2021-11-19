export default async function ({ addon, global, console, msg }) {
  var posts = document.querySelectorAll(".blockpost");
  var savedData = []
  var savedUsernames = [];
  var idx = 0;
  posts.forEach(async (i) => {
    idx++;
    let username = i.querySelector(".username").innerText;
    let left = i.querySelector(".postleft").children[0];

    const { userStatus, color, spush } = await fetchStatus(username, savedUsernames, savedData, idx);
    /* console.log(userStatus, color, spush); */
    if (spush === true) {
      // so we need to add in this user
      /* console.log(savedUsernames,savedData) */
      savedUsernames.push(username.toLowerCase());
      savedData.push({ status: userStatus, color: color });
    }
    if (userStatus) {
      let br = document.createElement("br");
      addon.tab.displayNoneWhileDisabled(br);
      let status = document.createElement("i");
      addon.tab.displayNoneWhileDisabled(status);
      status.title = msg("status-hover");
      status.innerText = userStatus;

      let dot = document.createElement("span");
      addon.tab.displayNoneWhileDisabled(dot, { display: "inline-block" });
      dot.title = msg("status-hover");
      dot.className = "my-ocular-dot";

      dot.style.backgroundColor = color;

      left.appendChild(br);
      left.appendChild(status);
      if (color) left.appendChild(dot);
    }
  });

  async function fetchStatus(username, usernames, savedDatas, idx) {
    /* console.log(username, usernames, savedDatas, idx) */
    if (usernames.includes(username.toLowerCase())) {
      console.log(username)
      return {
        userStatus: savedDatas[idx].status,
        color: savedDatas[idx].color,
        spush: true,
      };
    } else {
      const response = await fetch(`https://my-ocular.jeffalo.net/api/user/${username}`);
      const data = await response.json();
      return {
        userStatus: data.status,
        color: data.color,
        spush: true,
      };
    }
  }
}
