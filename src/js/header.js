document.querySelector("body > header").innerHTML = `
<figure id="logo-container">
<img src="./src/img/logo-typeface.png" alt="Ovenpedia" />
</figure>
<nav>
<div id="hamburger" class="">
  <span></span>
  <span></span>
  <span></span>
</div>

<div id="nav" class="">

  <ul>
    <li><a href="./index.html">Home</a></li>
    <li><a href="./calibrate.html">Calibrate your stove</a></li>
    <li><a href="./account.html">Account</a></li>
  </ul>
</div>
</nav>
`

const active = document.querySelector(
  `[href$="${window.location.pathname.split("/").pop()}"]`
);

if (active) {
  list = active.closest("ul");
  if (list) {
    active.classList.add("selected");
  }
}

$('#hamburger').on('click', function () {
  $(this).toggleClass('close');
  $('#nav').toggleClass('visible')
  $('article').toggleClass('hidden')
})

$('.card').on('click', function () {

  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected');
  } else {
    $('.card').each(function () {
      $(this).removeClass('selected');
    })

    $(this).addClass('selected');
  }
})