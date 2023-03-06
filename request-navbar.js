var xhr = new XMLHttpRequest();
xhr.open("GET", "navbar.html", true);
xhr.onreadystatechange = function () {
  if (this.readyState === 4 && this.status === 200) {
    document.getElementById("nav-menu").innerHTML = this.responseText;
  }
};
xhr.send();
