from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API routes
    path("create_post", views.create_post, name="create_post"),
    # path("post", views.post, name="post"),
    path("pages", views.pages, name="pages"),
    path("profile/<str:user_name>", views.profile, name="profile"),
    # path("following", views.following, name="following"),
]
