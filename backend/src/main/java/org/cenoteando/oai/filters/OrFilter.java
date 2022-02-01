package org.cenoteando.oai.filters;

import org.cenoteando.oai.model.CenoteandoItem;

public class OrFilter extends CenoteandoFilter {
    private final CenoteandoFilter left;
    private final CenoteandoFilter right;

    public OrFilter(CenoteandoFilter left, CenoteandoFilter right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public String getQuery() {
        return "(" + left.getQuery() + ") OR (" + right.getQuery() + ")";
    }

    @Override
    public boolean isShown(CenoteandoItem item) {
        return left.isShown(item) || right.isShown(item);
    }
}

