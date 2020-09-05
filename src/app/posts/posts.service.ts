import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';

import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {

  private posts: Post[] = [];
  private post_feeder = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(
        "http://localhost:3000/api/posts"
      )
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;

        this.post_feeder.next([...this.posts]);//sugests what data to pass
      });
  }

  getPostUpdateListener() {//helps pass data to comp
    return this.post_feeder.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http
      .post<{ message: string, postId: string }>
      ("http://localhost:3000/api/posts", post)
      .subscribe(res => {       
         this.posts.push(res);

        this.post_feeder.next([...this.posts]);
      });
  }

  deletePost(postId: string) {
    this.http.delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId);

        this.post_feeder.next([...this.posts]);
      });
  }
}
