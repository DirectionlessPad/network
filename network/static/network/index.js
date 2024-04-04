let pageCounter = 1;


document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#profile').addEventListener('click', () => {
        resetPageCounter()
        let username = document.querySelector('#profile').dataset.user.toString()
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
    document.querySelector('#newpost-form').onsubmit = () => {
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
    // history.pushState({ page: "following" }, "", "following")
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
                createFollowButton(user, profile_display, data)
            }
            document.querySelector('#profileinfo').append(profile_display);

            data.posts.forEach(
                addPost
            );
            paginate(data.num_pages, function () { showProfile(user) })
        });
    // history.pushState({ page: "profile" }, "", "profile")
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
    // history.pushState({ page: "all_posts" }, "", "all_posts")

};

function addPost(postinfo) {
    // Create new post
    const post = createCustomElement('div', 'post');
    const firstRow = createCustomElement('div', 'row');
    const poster = createCustomElement('h3', ['col-6', 'link-behaviour']);
    poster.innerHTML = postinfo.poster;
    poster.addEventListener('click', () => {
        resetPageCounter()
        showProfile(profile = postinfo.poster)
    })
    firstRow.appendChild(poster);
    const content = document.createElement('div');
    content.innerHTML = postinfo.content;
    if (postinfo.poster === document.querySelector('#profile').dataset.user.toString()) {
        editDiv = createEditButton(content, postinfo)
        firstRow.appendChild(editDiv);
    }
    const lastRow = createCustomElement('div', 'row');
    const timestamp = createCustomElement('div', 'col-6');
    timestamp.innerHTML = postinfo.timestamp
    const likeDiv = createLikeButton(postinfo)
    lastRow.appendChild(timestamp);
    lastRow.appendChild(likeDiv);
    post.appendChild(firstRow)
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
        const pageButtons = createCustomElement('ul', ['pagination', 'justify-content-center'])
        if (pageCounter > 1) {
            prevButton = createCustomElement('li', 'page-item')
            prevButton.innerHTML = '<a class="page-link" href="#">Previous</a>'
            pageButtons.appendChild(prevButton)
            prevButton.addEventListener("click", () => {
                pageCounter--;
                loadFunction();
            })
        };
        for (let i = 0; i < numPages; i++) {
            const pageNumber = i + 1
            const pageNumberButton = createCustomElement('li', 'page-item');
            pageNumberButton.innerHTML = `<a class="page-link" href="#">${pageNumber}</a>`;
            pageButtons.appendChild(pageNumberButton);
            pageNumberButton.addEventListener("click", () => {
                pageCounter = pageNumber
                loadFunction()
            })
        }
        if (pageCounter < numPages) {
            nextButton = createCustomElement('li', 'page-item');
            nextButton.innerHTML = '<a class="page-link" href="#">Next</a>';
            pageButtons.appendChild(nextButton);
            nextButton.addEventListener("click", () => {
                pageCounter++;
                loadFunction();
            })
        };
        document.querySelector('#listposts').appendChild(pageButtons)
    };
}

function createCustomElement(tag, classes) {
    classes = [].concat(classes)
    element = document.createElement(tag)
    if (classes) {
        classes.forEach((htmlclass) => {
            element.classList.add(htmlclass)
        })
    }
    return element
}

function createFollowButton(user, profile_display, data) {
    const followButton = document.createElement('button')
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

function createEditButton(content, postinfo) {
    const editDiv = createCustomElement('div', 'col-6');
    editDiv.style.textAlign = "right";
    const editButton = document.createElement('button');
    editButton.innerHTML = "Edit"
    editDiv.appendChild(editButton);
    editButton.addEventListener("click", () => {
        content.innerHTML = "";
        const editPostForm = document.createElement('form');
        editPostForm.id = "editpost-form";
        const editPostBody = createCustomElement('textarea', 'form-control');
        editPostBody.innerHTML = postinfo.content;
        editPostForm.appendChild(editPostBody);
        const editPostSubmit = createCustomElement('input', ['btn', 'btn-primary'])
        editPostSubmit.type = "submit";
        editPostForm.appendChild(editPostSubmit);
        content.appendChild(editPostForm);
        editPostForm.onsubmit = () => {
            event.preventDefault()
            editedBody = editPostBody.value;
            var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            fetch(`/post/${postinfo.id}`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    body: editedBody,
                })
            })
            content.replaceChildren();
            content.innerHTML = editedBody;
        }
    })
    return editDiv
}

function createLikeButton(postinfo) {
    const likeDiv = createCustomElement('span', 'col-6');
    const likeButton = document.createElement('button');
    likeDiv.appendChild(likeButton);
    likeDiv.style.textAlign = "right";
    let liked = postinfo.liked_by.includes(document.querySelector('#profile').dataset.user.toString())
    likeButton.addEventListener("click", () => {
        var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        fetch(`/post/${postinfo.id}`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                liked: liked,
            })
        })
            .then(response => response.json())
            .then(newpostinfo => {
                likeButtonContent(newpostinfo, likeButton)
            })
    })
    likeButtonContent(postinfo, likeButton)
    return likeDiv
}

function likeButtonContent(postinfo, likeButton) {
    let liked = postinfo.liked_by.includes(document.querySelector('#profile').dataset.user.toString())
    if (liked) {
        likeButton.innerHTML = `Unlike: ${postinfo.liked_by.length}`;
    } else {
        likeButton.innerHTML = `Like: ${postinfo.liked_by.length}`;
    }
}

// window.onpopstate = function (event) {
//     show_view(event.state.page)
// }