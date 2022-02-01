package org.cenoteando.services;

import com.google.api.gax.paging.Page;
import com.google.cloud.storage.*;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CloudStorageService {

    private Storage storage = StorageOptions.getDefaultInstance().getService();

    public List<String> getPhotos(String id){
        Page<Blob> blobs =
                storage.list(
                        "cenoteando_teste",
                        Storage.BlobListOption.prefix("photos/" + id + "/"),
                        Storage.BlobListOption.currentDirectory());
        return signedURL(blobs);
    }

    public List<String> getMaps(String id){
        Page<Blob> blobs =
                storage.list(
                        "cenoteando_teste",
                        Storage.BlobListOption.prefix("maps/" + id + "/"),
                        Storage.BlobListOption.currentDirectory());

        return signedURL(blobs);
    }

    public ArrayList<String> signedURL(Page<Blob> blobs){
        ArrayList<String> urls = new ArrayList<>();
        for (Blob blob : blobs.iterateAll()) {
            URL url = storage.signUrl(blob, 15, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());
            urls.add(String.valueOf(url));
        }
        return urls;
    }
}
