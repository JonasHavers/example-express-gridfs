# Example for using MongoDB GridFS in an Express application

## What is GridFS?

[https://www.mongodb.com/docs/manual/core/gridfs/](https://www.mongodb.com/docs/manual/core/gridfs/)

> GridFS is a specification for storing and retrieving files that exceed the BSON-document size limit of 16 MB.
> \
> \
> Instead of storing a file in a single document, GridFS divides the file into parts, or chunks [1], and stores each chunk as a separate document. By default, GridFS uses a default chunk size of 255 kB; that is, GridFS divides a file into chunks of 255 kB with the exception of the last chunk. The last chunk is only as large as necessary. Similarly, files that are no larger than the chunk size only have a final chunk, using only as much space as needed plus some additional metadata.
> \
> \
> GridFS uses two collections to store files. One collection stores the file chunks, and the other stores file metadata.
> \
> \
> When you query GridFS for a file, the driver will reassemble the chunks as needed. You can perform range queries on files stored through GridFS. You can also access information from arbitrary sections of files, such as to "skip" to the middle of a video or audio file.
> \
> \
> GridFS is useful not only for storing files that exceed 16 MB but also for storing any files for which you want access without having to load the entire file into memory.

## How to run the application?

1. Install dependencies

    ```sh
    npm install
    ```

2. Run the server:

    ```sh
    npm start
    ```

    You should see the following output:
    ```
    Server running on port 3000
    Database connected
    ```

3. Open your browser at (default)
    
    [http://localhost:3000](http://localhost:3000)

