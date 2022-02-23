package org.cenoteando.oai.repository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.lyncode.xoai.dataprovider.core.ListItemIdentifiersResult;
import com.lyncode.xoai.dataprovider.core.ListItemsResults;
import com.lyncode.xoai.dataprovider.data.Item;
import com.lyncode.xoai.dataprovider.data.ItemIdentifier;
import com.lyncode.xoai.dataprovider.exceptions.IdDoesNotExistException;
import com.lyncode.xoai.dataprovider.exceptions.OAIException;
import com.lyncode.xoai.dataprovider.filter.ScopedFilter;
import com.lyncode.xoai.dataprovider.services.api.ItemRepository;

import org.cenoteando.models.Cenote;
import org.cenoteando.oai.model.CenoteandoItem;
import org.cenoteando.repository.CenotesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

// TODO: Rewrite javadocs

@Component
public class CenoteandoItemRepository implements ItemRepository {

    @Autowired
    CenotesRepository cenotesRepository;

    /**
     * Gets an item from the data source.
     *
     * @param identifier Unique identifier of the item
     * @return ItemHelper
     */
    @Override
    public Item getItem(String identifier) throws IdDoesNotExistException, OAIException {

        String id = CenoteandoItem.parseHandle(identifier);
        Cenote cenote = cenotesRepository.findByArangoId(id);
        if (cenote == null)
            throw new IdDoesNotExistException(identifier);
        return new CenoteandoItem(cenote);

    }

    /**
     * Gets a paged list of identifiers. The metadata prefix parameter is internally converted to a list of filters.
     * That is, when configuring XOAI, it is possible to associate to each metadata format a list of filters.
     *
     * @param filters
     * @param offset  Start offset
     * @param length  Max items returned
     * @param setSpec Set Spec
     * @param from    Date parameter
     * @param until   Date parameter
     * @return List of identifiers
     */
    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length, String setSpec, Date from, Date until) throws OAIException {
        // TODO: Implement this (filter by dates and check setSpec)
        final Pageable page = PageRequest.of(offset, length, Sort.by("c._key"));
        Page<Cenote> cenotes = cenotesRepository.findAll(page);
        List<ItemIdentifier> results = cenotes.stream()
                .map(CenoteandoItem::new)
                .collect(Collectors.toList());
        return new ListItemIdentifiersResult(cenotes.hasNext(), results);
    }

    /**
     * Gets a paged list of items. The metadata prefix parameter is internally converted to a list of filters.
     * That is, when configuring XOAI, it is possible to associate to each metadata format a list of filters.
     *
     * @param filters
     * @param offset  Start offset
     * @param length  Max items returned
     * @param setSpec Set spec
     * @param from    Date parameter
     * @param until   Date parameter
     * @return List of Items
     */
    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length, String setSpec, Date from, Date until) throws OAIException {
        final Pageable page = PageRequest.of(offset, length, Sort.by("c._key"));
        Page<Cenote> cenotes = cenotesRepository.findAll(page);
        List<Item> results = cenotes.stream()
                .map(CenoteandoItem::new)
                .collect(Collectors.toList());
        return new ListItemsResults(cenotes.hasNext(), results);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length) throws OAIException {
        return getItemIdentifiers(filters, offset, length, null, null, null);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length, Date from) throws OAIException {
        return getItemIdentifiers(filters, offset, length, null, null, null);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiersUntil(List<ScopedFilter> filters, int offset, int length, Date until) throws OAIException {
        return getItemIdentifiers(filters, offset, length, null, null, until);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length, Date from, Date until) throws OAIException {
        return getItemIdentifiers(filters, offset, length, null, null, until);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length, String setSpec) throws OAIException {
        return getItemIdentifiers(filters, offset, length, setSpec, null, null);
    }

    @Override
    public ListItemIdentifiersResult getItemIdentifiers(List<ScopedFilter> filters, int offset, int length, String setSpec, Date from) throws OAIException {
        return getItemIdentifiers(filters, offset, length, setSpec, from, null);
    }
    @Override
    public ListItemIdentifiersResult getItemIdentifiersUntil(List<ScopedFilter> filters, int offset, int length, String setSpec, Date until) throws OAIException {
        return getItemIdentifiers(filters, offset, length, setSpec, null, until);
    }

    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length) throws OAIException {
        return getItems(filters, offset, length, null, null, null);
    }

    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length, Date from) throws OAIException {
        return getItems(filters, offset, length, null, from, null);
    }

    @Override
    public ListItemsResults getItemsUntil(List<ScopedFilter> filters, int offset, int length, Date until) throws OAIException {
        return getItems(filters, offset, length, null, null, until);
    }

    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length, Date from, Date until) throws OAIException {
        return getItems(filters, offset, length, null, from, until);
    }

    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length, String setSpec) throws OAIException {
        return getItems(filters, offset, length, setSpec, null, null);
    }

    @Override
    public ListItemsResults getItems(List<ScopedFilter> filters, int offset, int length, String setSpec, Date from) throws OAIException {
        return getItems(filters, offset, length, setSpec, from, null);
    }

    @Override
    public ListItemsResults getItemsUntil(List<ScopedFilter> filters, int offset, int length, String setSpec, Date until) throws OAIException {
        return getItems(filters, offset, length, setSpec, null, until);
    }
}
