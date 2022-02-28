package org.cenoteando.oai.filters;

import org.cenoteando.oai.model.CenoteandoItem;

public class AndFilter extends CenoteandoFilter {

    private final CenoteandoFilter left;
    private final CenoteandoFilter right;

    public AndFilter(CenoteandoFilter left, CenoteandoFilter right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public String getQuery() {
        return "(" + left.getQuery() + ") AND (" + right.getQuery() + ")";
    }

    @Override
    public boolean isShown(CenoteandoItem item) {
        return left.isShown(item) && right.isShown(item);
    }
}
