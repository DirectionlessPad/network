from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API routes
    path("create_post", views.create_post, name="create_post"),
    path("all_posts", views.all_posts, name="all_posts"),
    path("profile/<str:user_name>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path("follow/<str:user_name>", views.follow, name="follow"),
    path("post/<int:post_id>", views.post, name="post"),
]
