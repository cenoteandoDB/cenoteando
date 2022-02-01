package org.cenoteando.oai.filters;

import org.cenoteando.oai.model.CenoteandoItem;

public class CenoteandoWithdrawnFilter extends CenoteandoFilter {
    @Override
    public boolean isShown(CenoteandoItem item) {
        return item.isDeleted();
    }

    @Override
    public String getQuery() {
        // TODO: Implement this?
        return null;
    }
}
