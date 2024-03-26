let pageCounter = 1;

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#newpost-title').addEventListener('click', () => {
        document.querySelector('#newpost-form').style.display = 'block'
    });
    newPost();
    loadposts();
});

function newPost() {
    var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    document.querySelector('form').onsubmit = () => {
        fetch('/create_post', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                body: document.querySelector('#newpost-content').value,
            })
        });
        return false
    }
}

function loadposts() {
    document.querySelector("#listposts").replaceChildren()
    fetch(`/pages?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(
                // Need to actually add HTML to display the post
                add_post
            );
            if (data.num_pages > 1) {
                const pageButtons = document.createElement('div')
                if (pageCounter > 1) {
                    prevButton = document.createElement('button')
                    prevButton.innerHTML = "Previous"
                    pageButtons.appendChild(prevButton)
                    prevButton.addEventListener("click", () => {
                        pageCounter--;
                        loadposts();
                    })
                };
                if (pageCounter < data.num_pages) {
                    nextButton = document.createElement('button')
                    nextButton.innerHTML = "Next"
                    pageButtons.appendChild(nextButton)
                    nextButton.addEventListener("click", () => {
                        pageCounter++;
                        loadposts();
                    })
                };
                document.querySelector("#listposts").appendChild(pageButtons)
            };
        });

};

function add_post(contents) {

    // Create new post
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = contents;

    // Add post to DOM
    document.querySelector('#listposts').append(post);
};