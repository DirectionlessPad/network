document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#newpost-title').addEventListener('click', () => {
        document.querySelector('#newpost-form').style.display = 'block'
    })
    newPost()
})

function newPost() {
    var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    document.querySelector('form').onsubmit = () => {
        fetch('/posts', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                body: document.querySelector('#newpost-content').value,
            })
        })
        console.log(document.querySelector('#newpost-content').value)
        //return false
    }
}

// A function that receives a list of users and returns all posts by
// those users and displays them in reverse chronological ondragover.
// function list_posts(users) {

// }