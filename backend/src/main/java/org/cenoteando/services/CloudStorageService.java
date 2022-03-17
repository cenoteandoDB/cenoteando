package org.cenoteando.services;

import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.google.api.gax.paging.Page;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

import org.cenoteando.models.Reference;
import org.cenoteando.repository.ReferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CloudStorageService {

    @Autowired
    private ReferenceRepository referenceRepository;

    private Storage storage = StorageOptions.getDefaultInstance().getService();

    private final Logger log = LoggerFactory.getLogger(
        CloudStorageService.class
    );

    @Value("${gcs.bucket-name}")
    private String bucketName;

    public List<String> getPhotos(String id) {
        Page<Blob> blobs = storage.list(
            bucketName,
            Storage.BlobListOption.prefix("photos/" + id + "/"),
            Storage.BlobListOption.currentDirectory()
        );
        return signedURL(blobs);
    }

    public List<String> getMaps(String id) {
        Page<Blob> blobs = storage.list(
            bucketName,
            Storage.BlobListOption.prefix("maps/" + id + "/"),
            Storage.BlobListOption.currentDirectory()
        );

        return signedURL(blobs);
    }

    public List<String> signedURL(Page<Blob> blobs) {
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
            bucketName,
            Storage.BlobListOption.prefix("references/" + id + "."),
            Storage.BlobListOption.currentDirectory()
        );
        Iterator<Blob> blob = blobs.iterateAll().iterator();
        if (!blob.hasNext()) throw new Exception(
            "Unable to get reference " + id
        );

        return blob.next();
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void batchUpdateReferenceMetadata() {
        Page<Blob> blobs = storage.list(
            bucketName,
            Storage.BlobListOption.prefix("references/"),
            Storage.BlobListOption.currentDirectory()
        );

        referenceRepository.unsetAllHasFile();

        for (Blob blob : blobs.iterateAll()) {
            // Get reference id from blob
            String id = blob
                .getBlobId()
                .getName()
                .split("/")[1].split("[.]")[0];

            // Update reference to indicate file availability
            Reference ref = referenceRepository.findByKey(id);
            if (ref != null) {
                ref.setHasFile(true);
                referenceRepository.save(ref);
            } else {
                log.error("Reference {} not found", id);
            }
        }
    }
}
