package org.cenoteando.oai.filters;

import org.cenoteando.oai.model.CenoteandoItem;

public class NotFilter extends CenoteandoFilter {

  private final CenoteandoFilter filter;

  public NotFilter(CenoteandoFilter filter) {
    this.filter = filter;
  }

  @Override
  public boolean isShown(CenoteandoItem item) {
    return !filter.isShown(item);
  }

  @Override
  public String getQuery() {
    return "NOT (" + filter.getQuery() + ")";
  }
}
