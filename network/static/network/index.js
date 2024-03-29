let pageCounter = 1;

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#profile').addEventListener('click', () => {
        resetPageCounter()
        username = document.querySelector('#profile').dataset.user.toString()
        showProfile(profile = username)
    })
    document.querySelector('#following').addEventListener('click', () => {
        resetPageCounter()
        loadFollowedPosts()
    })
    document.querySelector('#home-button').addEventListener('click', () => {
        resetPageCounter()
        loadAllPosts()
    })
    document.querySelector('#newpost-title').addEventListener('click', () => {
        document.querySelector('#newpost-form').style.display = 'block'
    });
    loadAllPosts();
});

function newPost() {
    var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    document.querySelector('#newpost').style.display = 'block';
    document.querySelector('#profileinfo').style.display = 'none';
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
    }
}

function loadFollowedPosts() {
    document.querySelector('#newpost').style.display = 'none';
    document.querySelector('#profileinfo').style.display = 'none';
    document.querySelector('#listposts').replaceChildren();
    fetch(`/following?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(
                addPost
            );
            paginate(data.num_pages, loadFollowedPosts)
        })

}

function showProfile(user) {
    document.querySelector('#newpost').style.display = 'none';
    document.querySelector('#profileinfo').style.display = 'block';

    document.querySelector('#profileinfo').replaceChildren();
    document.querySelector('#listposts').replaceChildren();
    fetch(`/profile/${user}?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {

            profile_display = document.createElement('div')
            profile_display.innerHTML = `${data.profile_name}    Followers: ${data.followers}  Following: ${data.follows}   `

            if (user != document.querySelector('#profile').dataset.user.toString()) {
                followButton = document.createElement('button')
                profile_display.appendChild(followButton)
                if (data.currently_following) {
                    followButton.classList.add('unfollow')
                } else {
                    followButton.innerHTML = "Follow"
                }
                followButton.addEventListener("click", () => {
                    var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
                    fetch(`/follow/${user}`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            follow: !data.currently_following
                        })
                    })
                    showProfile(user)
                })
            }
            document.querySelector('#profileinfo').append(profile_display);

            data.posts.forEach(
                addPost
            );
            paginate(data.num_pages, function () { showProfile(user) })
        });
}

function loadAllPosts() {
    document.querySelector('#profileinfo').style.display = 'none';
    newPost();
    document.querySelector('#listposts').replaceChildren()
    fetch(`/all_posts?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(
                addPost
            );
            paginate(data.num_pages, loadAllPosts)
        });

};

function addPost(postinfo) {

    // Create new post
    const post = document.createElement('div');
    post.className = 'post';
    const poster = document.createElement('h3');
    poster.classList.add('link-behaviour')
    poster.innerHTML = postinfo.poster;
    poster.addEventListener('click', () => {
        resetPageCounter()
        username = postinfo.poster
        showProfile(profile = username)
    })
    const content = document.createElement('div');
    content.innerHTML = postinfo.content;
    const lastRow = document.createElement('div');
    lastRow.classList.add('row');
    const timestamp = document.createElement('div');
    timestamp.classList.add('col-6');
    timestamp.innerHTML = postinfo.timestamp
    const likeDiv = document.createElement('div');
    likeDiv.classList.add('col-6');
    const likeButton = document.createElement('button');
    likeDiv.appendChild(likeButton);
    likeDiv.style.textAlign = "right"
    likeButton.innerHTML = "Like"
    lastRow.appendChild(timestamp);
    lastRow.appendChild(likeDiv);
    post.appendChild(poster)
    post.appendChild(content)
    post.appendChild(lastRow)

    // Add post to DOM
    document.querySelector('#listposts').append(post);
};

function resetPageCounter() {
    pageCounter = 1;
}

function paginate(numPages, loadFunction) {
    if (numPages > 1) {
        const pageNav = document.createElement('nav')
        pageNav.ariaLabel = "Page Navigation"
        const pageButtons = document.createElement('ul')
        pageButtons.classList.add("pagination")
        pageButtons.classList.add("justify-content-center")
        if (pageCounter > 1) {
            prevButton = document.createElement('li')
            prevButton.classList.add("page-item")
            prevButton.innerHTML = '<a class="page-link" href="#">Previous</a>'
            pageButtons.appendChild(prevButton)
            prevButton.addEventListener("click", () => {
                pageCounter--;
                loadFunction();
            })
        };
        for (let i = 0; i < numPages; i++) {
            const pageNumber = i + 1
            const pageNumberButton = document.createElement('li');
            pageNumberButton.innerHTML = `<a class="page-link" href="#">${pageNumber}</a>`;
            pageNumberButton.classList.add("page-item")
            pageButtons.appendChild(pageNumberButton);
            pageNumberButton.addEventListener("click", () => {
                pageCounter = pageNumber
                loadFunction()
            })
        }
        if (pageCounter < numPages) {
            nextButton = document.createElement('li');
            nextButton.innerHTML = '<a class="page-link" href="#">Next</a>';
            nextButton.classList.add("page-item")
            pageButtons.appendChild(nextButton);
            nextButton.addEventListener("click", () => {
                pageCounter++;
                loadFunction();
            })
        };
        document.querySelector('#listposts').appendChild(pageButtons)
    };
}