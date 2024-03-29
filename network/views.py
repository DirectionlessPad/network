import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from . import paginate
from time import sleep

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
            user_follow = Follow.objects.create(user=user)
            user_follow.save()
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
    profile_user = User.objects.get(username=user_name)
    posts = Post.objects.filter(poster=profile_user)
    sleep(0.01)
    num_followers = len(profile_user.followers.all())
    num_follows = len(Follow.objects.get(user=profile_user).following.all())
    # check to see if the user is following the profile
    currently_following = (
        Follow.objects.get(user=request.user)
        .following.filter(username=user_name)
        .exists()
    )
    page_number = request.GET.get("page")
    page_obj, num_pages = paginate(posts, page_number)
    return JsonResponse(
        {
            "currently_following": currently_following,
            "num_pages": num_pages,
            "posts": [post.serialize() for post in page_obj],
            "profile_name": user_name,
            "followers": num_followers,
            "follows": num_follows,
        }
    )


def following(request):
    # Get all the users this user follows
    follows = Follow.objects.get(user=request.user).following.all()
    posts = Post.objects.filter(poster__in=follows)
    page_number = request.GET.get("page")
    page_obj, num_pages = paginate(posts, page_number)
    return JsonResponse(
        {
            "num_pages": num_pages,
            "posts": [post.serialize() for post in page_obj],
        }
    )


def all_posts(request):
    posts = Post.objects.all()
    page_number = request.GET.get("page")
    page_obj, num_pages = paginate(posts, page_number)

    # Return list of posts
    return JsonResponse(
        {
            "num_pages": num_pages,
            "posts": [post.serialize() for post in page_obj],
        }
    )


def follow(request, user_name):
    follow = Follow.objects.get(user=request.user)
    user_to_follow = User.objects.get(username=user_name)
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("follow"):
            follow.following.add(user_to_follow)
        else:
            follow.following.remove(user_to_follow)
        return HttpResponse(status=204)


def post(request, post_id):
    print("visited")
    if request.method == "POST":
        # Query for requested email
        data = json.loads(request.body)
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found."}, status=404)

        post.content = data.get("body", "")
        post.save()
        return HttpResponse(status=204)

    # # Return email contents
    # if request.method == "GET":
    #     return JsonResponse(post.serialize())

    # # Email must be via GET or PUT
    # else:
    #     return JsonResponse({"error": "GET or PUT request required."}, status=400)
