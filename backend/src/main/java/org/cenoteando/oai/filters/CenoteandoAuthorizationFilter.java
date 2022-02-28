package org.cenoteando.oai.filters;

import org.cenoteando.oai.model.CenoteandoItem;

// TODO: Improve authorization for OAI
public class CenoteandoAuthorizationFilter extends CenoteandoFilter {

    @Override
    public boolean isShown(CenoteandoItem item) {
        return item.isPublic();
    }

    @Override
    public String getQuery() {
        // TODO: Implement this?
        return null;
    }
}
