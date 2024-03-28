from django.core.paginator import Paginator


def paginate(posts, page_number):
    posts = posts.order_by("-timestamp").all()
    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(page_number)
    num_pages = paginator.num_pages
    return page_obj, num_pages
