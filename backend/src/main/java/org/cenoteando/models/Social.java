package org.cenoteando.models;

public class Social {

    private int totalComments;
    private float rating;

    public Social() {
        totalComments = 0;
        rating = 0;
    }

    public Social(int totalComments, float rating) {
        this.totalComments = totalComments;
        this.rating = rating;
    }

    public int getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(int totalComments) {
        this.totalComments = totalComments;
    }

    public float getRating() {
        return rating;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    @Override
    public String toString() {
        return "{ " + totalComments + ", " + rating + " }";
    }
}

