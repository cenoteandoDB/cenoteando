package org.cenoteando;

import static org.junit.jupiter.api.Assertions.assertNull;

import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.repository.CommentBucketRepository;
import org.cenoteando.repository.GadmRepository;
import org.cenoteando.repository.MeasurementsOrFactsRepository;
import org.cenoteando.repository.ReferenceRepository;
import org.cenoteando.repository.SpeciesRepository;
import org.cenoteando.repository.UsersRepository;
import org.cenoteando.repository.VariablesRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class CenoteandoBackendApplicationTests {

    @MockBean
    CenotesRepository mockCenotesRepository;

    @MockBean
    CommentBucketRepository mockCommentBucketRepository;

    @MockBean
    GadmRepository mockGadmRepository;

    @MockBean
    MeasurementsOrFactsRepository mockMeasurementsOrFactsRepository;

    @MockBean
    ReferenceRepository mockReferenceRepository;

    @MockBean
    SpeciesRepository mockSpeciesRepository;

    @MockBean
    UsersRepository mockUsersRepository;

    @MockBean
    VariablesRepository mockVariablesRepository;

    @Test
    void contextLoads() {
        assertNull(null);
    }
}
