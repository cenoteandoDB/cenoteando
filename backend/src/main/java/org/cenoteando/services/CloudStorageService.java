package org.cenoteando.services;

import com.google.api.gax.paging.Page;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CloudStorageService {

    private Storage storage = StorageOptions.getDefaultInstance().getService();

    @Value("${gcs.bucket-name}")
    private String BUCKET_NAME;

    public List<String> getPhotos(String id) {
        Page<Blob> blobs = storage.list(
            BUCKET_NAME,
            Storage.BlobListOption.prefix("photos/" + id + "/"),
            Storage.BlobListOption.currentDirectory()
        );
        return signedURL(blobs);
    }

    public List<String> getMaps(String id) {
        Page<Blob> blobs = storage.list(
            BUCKET_NAME,
            Storage.BlobListOption.prefix("maps/" + id + "/"),
            Storage.BlobListOption.currentDirectory()
        );

        return signedURL(blobs);
    }

    public ArrayList<String> signedURL(Page<Blob> blobs) {
        ArrayList<String> urls = new ArrayList<>();
        for (Blob blob : blobs.iterateAll()) {
            URL url = storage.signUrl(
                blob,
                15,
                TimeUnit.MINUTES,
                Storage.SignUrlOption.withV4Signature()
            );
            urls.add(String.valueOf(url));
        }
        return urls;
    }

    public Blob downloadReference(String id) throws Exception {
        Page<Blob> blobs = storage.list(
            BUCKET_NAME,
            Storage.BlobListOption.prefix("references/" + id + "."),
            Storage.BlobListOption.currentDirectory()
        );
        Iterator<Blob> blob = blobs.iterateAll().iterator();
        if (!blob.hasNext()) throw new Exception(
            "Unable to get reference " + id
        );

        return blob.next();
    }
}
