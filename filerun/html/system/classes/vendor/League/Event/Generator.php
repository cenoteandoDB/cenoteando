<?php

namespace League\Event;

class Generator implements GeneratorInterface
{
    /**
     * The registered events.
     *
     * @var EventInterface[]
     */
    protected $events = array();

    /**
     * Add an event.
     *
     * @param EventInterface $event
     *
     * @return $this
     */
    public function addEvent(EventInterface $event)
    {
        $this->events[] = $event;

        return $this;
    }

    /**
     * Release all the added events.
     *
     * @return EventInterface[]
     */
    public function releaseEvents()
    {
        $events = $this->events;
        $this->events = array();

        return $events;
    }
}
