const uploadElm = document.querySelectorAll(".upload");
const statusElm = document.createElement("span");

statusElm.className = "alert-message hide";
statusElm.textContent = "debug";

document.querySelector("body").appendChild(statusElm);

uploadElm.forEach((v, k) =>
  v.addEventListener("click", async (e) => {
    try {
      const target = v.classList[1];
      const fileElm = document.querySelector(`.${target} > input[type="file"]`);
      const formData = new FormData();
      formData.append("file", fileElm.files[0]);
      formData.append("target", target);
      const response = await fetch("http://localhost:3000/generate/checklist_pengiriman", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        statusElm.style.color = "green";
      } else {
        statusElm.style.color = "red";
      }

      response
        .json()
        .then((v) => {
          statusElm.textContent = v["message"];
          statusElm.classList.remove("hide");
        })
        .catch((e) => alert(e));
    } catch (e) {
      statusElm.textContent = "An error occured: " + e.message;
      statusElm.style.color = "red";
      statusElm.classList.remove("hide");
    }
  })
);
