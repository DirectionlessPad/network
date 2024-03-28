let pageCounter = 1;

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#profile').addEventListener('click', () => {
        resetPageCounter()
        username = document.querySelector('#profile').dataset.user.toString()
        showProfile(profile = username)
    })
    document.querySelector('#following').addEventListener('click', () => {
        resetPageCounter()
        // loadPosts(page = "following", resetPageCounter = true)
    })
    document.querySelector('#home-button').addEventListener('click', () => {
        resetPageCounter()
        loadAllPosts()
    })
    document.querySelector('#newpost-title').addEventListener('click', () => {
        document.querySelector('#newpost-form').style.display = 'block'
    });
    newPost();
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
        return false
    }
}

function showProfile(user) {
    document.querySelector('#newpost').style.display = 'none';
    document.querySelector('#profileinfo').style.display = 'block';

    document.querySelector('#listposts').replaceChildren()
    fetch(`/profile/${user}?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            profile_display = document.createElement('div')
            profile_display.innerHTML = `${data.profile_name}    Followers: ${data.followers}  Following: ${data.follows}`
            if (user != document.querySelector('#profile').dataset.user.toString()) {
                follow_button = document.createElement('button')
                if (data.currently_following) {
                    follow_button.innerHTML = "Unfollow"
                } else {
                    follow_button.innerHTML = "Follow"
                }
            }
            document.querySelector('#profileinfo').append(profile_display);

            data.posts.forEach(
                addPost
            );
            paginate(data.num_pages, function () { showProfile(user) })
        });
}

function loadAllPosts() {
    newPost();
    document.querySelector('#listposts').replaceChildren()
    fetch(`/all_posts?page=${pageCounter}`)
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(
                // Need to actually add HTML to display the post
                addPost
            );
            paginate(data.num_pages, loadAllPosts)
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

function resetPageCounter() {
    pageCounter = 1;
}

function paginate(numPages, loadFunction) {
    if (numPages > 1) {
        const pageButtons = document.createElement('div')
        if (pageCounter > 1) {
            prevButton = document.createElement('button')
            prevButton.innerHTML = "Previous"
            pageButtons.appendChild(prevButton)
            prevButton.addEventListener("click", () => {
                pageCounter--;
                loadFunction(page);
            })
        };
        if (pageCounter < numPages) {
            nextButton = document.createElement('button')
            nextButton.innerHTML = "Next"
            pageButtons.appendChild(nextButton)
            nextButton.addEventListener("click", () => {
                pageCounter++;
                loadFunction(page);
            })
        };
        document.querySelector('#listposts').appendChild(pageButtons)
    };
}