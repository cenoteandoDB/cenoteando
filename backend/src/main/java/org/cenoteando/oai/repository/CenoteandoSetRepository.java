package org.cenoteando.oai.repository;

import com.lyncode.xoai.dataprovider.core.ListSetsResult;
import com.lyncode.xoai.dataprovider.core.Set;
import com.lyncode.xoai.dataprovider.services.api.SetRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class CenoteandoSetRepository implements SetRepository {
    /**
     * Checks if the actual data source supports sets.
     *
     * @return Supports sets?
     */
    @Override
    public boolean supportSets() {
        return false;
    }

    /**
     * Returns a paged list of sets.
     * It is common to use a partial result of 100 sets however, in XOAI this is a configured parameter.
     *
     * @param offset Starting offset
     * @param length Max size of the returned list
     * @return List of Sets
     */
    @Override
    public ListSetsResult retrieveSets(int offset, int length) {
        return new ListSetsResult(false, new ArrayList<Set>());
    }

    /**
     * Checks if a specific set exists in the data source.
     *
     * @param setSpec Set spec
     * @return Set exists
     */
    @Override
    public boolean exists(String setSpec) {
        return false;
    }
}
