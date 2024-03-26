import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post, Follow


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def create_post(request):
    print("made it to python")
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    post = Post(
        content=data.get("body", ""),
        poster=request.user,
    )
    post.save()
    return JsonResponse({"message": "Post made successfully."}, status=201)


def profile(request, user_name):
    pass


# def following(request):
#     pass


def pages(request):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    paginator = Paginator(posts, 10)

    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    # Return list of posts
    return JsonResponse(
        {
            "num_pages": paginator.num_pages,
            "posts": [post.serialize() for post in page_obj],
        }
    )


# def post(request, post_id):

#     # Query for requested email
#     try:
#         post = Post.objects.get(pk=post_id)
#     except Post.DoesNotExist:
#         return JsonResponse({"error": "Post not found."}, status=404)

#     # Return email contents
#     if request.method == "GET":
#         return JsonResponse(post.serialize())

#     # Email must be via GET or PUT
#     else:
#         return JsonResponse({"error": "GET or PUT request required."}, status=400)
