let pageCounter = 1;

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#profile').addEventListener('click', () => loadPosts("profile"))
    document.querySelector('#following').addEventListener('click', () => loadPosts("following"))
    document.querySelector('#home-button').addEventListener('click', () => loadPosts("all_posts"))
    document.querySelector('#newpost-title').addEventListener('click', () => {
        document.querySelector('#newpost-form').style.display = 'block'
    });
    newPost();
    loadPosts("all_posts");
});

function newPost() {
    var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    document.querySelector('#newpost').style.display = 'block'
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

function loadPosts(page) {
    if (page === "all_posts") {
        newPost();
    } else {
        document.querySelector('#newpost').style.display = 'none'
    }
    document.querySelector('#listposts').replaceChildren()
    fetch(`/all_posts?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(
                // Need to actually add HTML to display the post
                addPost
            );
            if (data.num_pages > 1) {
                const pageButtons = document.createElement('div')
                if (pageCounter > 1) {
                    prevButton = document.createElement('button')
                    prevButton.innerHTML = "Previous"
                    pageButtons.appendChild(prevButton)
                    prevButton.addEventListener("click", () => {
                        pageCounter--;
                        loadPosts();
                    })
                };
                if (pageCounter < data.num_pages) {
                    nextButton = document.createElement('button')
                    nextButton.innerHTML = "Next"
                    pageButtons.appendChild(nextButton)
                    nextButton.addEventListener("click", () => {
                        pageCounter++;
                        loadPosts();
                    })
                };
                document.querySelector('#listposts').appendChild(pageButtons)
            };
        });

};

function addPost(contents) {

    // Create new post
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = contents;

    // Add post to DOM
    document.querySelector('#listposts').append(post);
};