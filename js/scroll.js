// Scroll to specific section when clicking a dot
function scrollToSection(index) {
    const sections = document.querySelectorAll(".page-section");
    sections[index].scrollIntoView({ behavior: "smooth" });
}

// Update active dot when scrolling
document.querySelector(".page-container").addEventListener("scroll", () => {
    let sections = document.querySelectorAll(".page-section");
    let dots = document.querySelectorAll(".dot");

    sections.forEach((section, index) => {
        let rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            dots.forEach(dot => dot.classList.remove("active"));
            dots[index].classList.add("active");
        }
    });
});
